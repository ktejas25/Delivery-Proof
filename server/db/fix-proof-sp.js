require('dotenv').config({path: require('path').resolve('.env'), override: true});
const mysql = require('mysql2/promise');

async function fix() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA,
        multipleStatements: true
    });

    console.log('Connected. Dropping and recreating sp_complete_delivery_with_proof...');

    await c.query('DROP PROCEDURE IF EXISTS sp_complete_delivery_with_proof');

    await c.query(`
CREATE PROCEDURE sp_complete_delivery_with_proof(
    IN p_delivery_uuid VARCHAR(36),
    IN p_actor_id INT,
    IN p_proof_data JSON,
    IN p_verification_score DECIMAL(5,2),
    IN p_blockchain_tx_hash VARCHAR(255),
    OUT p_success BOOLEAN,
    OUT p_proof_id INT,
    OUT p_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_delivery_id INT;
    DECLARE v_business_id INT;
    DECLARE v_customer_id INT;
    DECLARE v_driver_id INT;
    DECLARE v_requires_signature BOOLEAN;
    DECLARE v_requires_photo BOOLEAN;
    DECLARE v_has_signature BOOLEAN DEFAULT FALSE;
    DECLARE v_has_photo BOOLEAN DEFAULT FALSE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_proof_id = NULL;
        SET p_message = 'Internal server error';
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Allow any non-delivered/non-failed delivery to have proof submitted
    -- Manager can complete any delivery in their business; Driver can complete assigned ones
    SELECT d.id, d.business_id, d.customer_id, d.driver_id, d.requires_signature, d.requires_photo
    INTO v_delivery_id, v_business_id, v_customer_id, v_driver_id, v_requires_signature, v_requires_photo
    FROM deliveries d
    WHERE d.uuid = p_delivery_uuid
      AND d.delivery_status NOT IN ('delivered', 'failed', 'cancelled')
    FOR UPDATE;

    IF v_delivery_id IS NULL THEN
        SET p_success = FALSE;
        SET p_proof_id = NULL;
        SET p_message = 'Delivery not found or already completed';
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    SET v_has_signature = COALESCE(JSON_EXTRACT(p_proof_data, '$.has_signature') = 1, FALSE);
    SET v_has_photo = COALESCE(JSON_EXTRACT(p_proof_data, '$.has_photo') = 1, FALSE);

    IF v_requires_signature AND NOT v_has_signature THEN
        SET p_success = FALSE;
        SET p_proof_id = NULL;
        SET p_message = 'Signature required for this delivery';
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    IF v_requires_photo AND NOT v_has_photo THEN
        SET p_success = FALSE;
        SET p_proof_id = NULL;
        SET p_message = 'Photo required for this delivery';
        ROLLBACK;
        LEAVE proc_label;
    END IF;

    -- Save delivery proof
    INSERT INTO delivery_proofs (delivery_id, submitted_by_id, proof_data, verification_score, blockchain_tx_hash, has_photo, has_signature)
    VALUES (v_delivery_id, p_actor_id, p_proof_data, p_verification_score, p_blockchain_tx_hash, v_has_photo, v_has_signature);

    SET p_proof_id = LAST_INSERT_ID();

    -- Mark delivery as delivered
    UPDATE deliveries
    SET delivery_status = 'delivered',
        actual_delivery_time = NOW(),
        -- Assign the actor as driver if still unassigned
        driver_id = COALESCE(v_driver_id, p_actor_id),
        updated_at = NOW()
    WHERE id = v_delivery_id;

    COMMIT;
    SET p_success = TRUE;
    SET p_message = 'Proof submitted and delivery completed';
END
    `);

    console.log('SUCCESS: sp_complete_delivery_with_proof updated');
    await c.end();
}

fix().catch(e => console.error('FAILED:', e.message));
