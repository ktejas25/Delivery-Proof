-- =====================================================
-- DeliveryProof Manager - Full Database Schema
-- MySQL 8.0+
-- =====================================================

-- ----------------------------------------------------------------------
-- 1. Core Tables
-- ----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS businesses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    stripe_customer_id VARCHAR(255),
    subscription_tier ENUM('starter', 'growth', 'pro') DEFAULT 'starter',
    subscription_status ENUM('active', 'past_due', 'canceled') DEFAULT 'active',
    default_language_code VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_business_uuid (uuid),
    INDEX idx_stripe_customer (stripe_customer_id)
);

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    business_id INT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    user_type ENUM('driver', 'manager', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    language_preference VARCHAR(10) DEFAULT 'en',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_user_uuid (uuid),
    INDEX idx_user_email (email),
    INDEX idx_user_business (business_id, user_type)
);

CREATE TABLE IF NOT EXISTS drivers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    license_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    hourly_rate DECIMAL(10,2),
    total_deliveries INT DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    last_location_lat DECIMAL(10,8),
    last_location_lng DECIMAL(11,8),
    last_location_update TIMESTAMP,
    is_available BOOLEAN DEFAULT TRUE,
    current_status ENUM('offline', 'available', 'on_delivery', 'break') DEFAULT 'offline',
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_driver_location (last_location_lat, last_location_lng),
    INDEX idx_driver_availability (is_available)
);

CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    business_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    location POINT NOT NULL SRID 4326,
    delivery_instructions TEXT,
    preferred_language_code VARCHAR(10) DEFAULT 'en',
    is_flagged BOOLEAN DEFAULT FALSE,
    total_orders INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_customer_uuid (uuid),
    INDEX idx_customer_business (business_id),
    INDEX idx_customer_phone (phone),
    SPATIAL INDEX idx_customer_location (location)
);

CREATE TABLE IF NOT EXISTS deliveries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    business_id INT NOT NULL,
    driver_id INT,
    customer_id INT NOT NULL,
    order_number VARCHAR(100),
    delivery_status ENUM('scheduled', 'dispatched', 'en_route', 'arrived', 'delivered', 'failed', 'disputed') DEFAULT 'scheduled',
    scheduled_time TIMESTAMP,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    actual_departure TIMESTAMP,
    delivery_notes TEXT,
    requires_signature BOOLEAN DEFAULT TRUE,
    requires_photo BOOLEAN DEFAULT TRUE,
    priority_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    route_optimization_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_delivery_uuid (uuid),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_delivery_business (business_id, delivery_status),
    INDEX idx_delivery_driver (driver_id, scheduled_time),
    INDEX idx_delivery_customer (customer_id, created_at),
    INDEX idx_delivery_scheduled (scheduled_time)
);

CREATE TABLE IF NOT EXISTS delivery_proofs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    proof_type ENUM('photo', 'signature', 'geolocation', 'comprehensive') NOT NULL,
    proof_data JSON,
    blockchain_tx_hash VARCHAR(255),
    blockchain_confirmed BOOLEAN DEFAULT FALSE,
    verification_score DECIMAL(5,2),
    ai_analysis_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    INDEX idx_proof_delivery (delivery_id),
    INDEX idx_proof_blockchain (blockchain_tx_hash),
    INDEX idx_proof_score (verification_score)
);

CREATE TABLE IF NOT EXISTS delivery_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proof_id INT NOT NULL,
    s3_url VARCHAR(500) NOT NULL,
    s3_key VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(500),
    gps_lat DECIMAL(10,8),
    gps_lng DECIMAL(11,8),
    gps_accuracy DECIMAL(5,2),
    compass_heading DECIMAL(5,2),
    device_model VARCHAR(100),
    image_hash VARCHAR(64),
    exif_data JSON,
    ai_analysis JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proof_id) REFERENCES delivery_proofs(id) ON DELETE CASCADE,
    INDEX idx_photo_proof (proof_id),
    INDEX idx_photo_hash (image_hash)
);

CREATE TABLE IF NOT EXISTS delivery_signatures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proof_id INT NOT NULL,
    s3_url VARCHAR(500) NOT NULL,
    signature_data TEXT,
    customer_name VARCHAR(255),
    signer_type ENUM('customer', 'neighbor', 'reception') DEFAULT 'customer',
    ip_address VARCHAR(45),
    user_agent TEXT,
    verification_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proof_id) REFERENCES delivery_proofs(id) ON DELETE CASCADE,
    INDEX idx_signature_proof (proof_id)
);

CREATE TABLE IF NOT EXISTS location_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    driver_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(5,2),
    speed DECIMAL(5,2),
    heading DECIMAL(5,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    INDEX idx_location_delivery (delivery_id),
    INDEX idx_location_driver_time (driver_id, recorded_at)
);

CREATE TABLE IF NOT EXISTS disputes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    dispute_type ENUM('not_received', 'damaged', 'wrong_item', 'late', 'other') NOT NULL,
    customer_claim TEXT,
    status ENUM('open', 'investigating', 'resolved', 'escalated', 'fraud') DEFAULT 'open',
    resolution ENUM('refund', 'redelivery', 'partial_refund', 'denied') DEFAULT NULL,
    resolution_amount DECIMAL(10,2),
    assigned_to INT,
    evidence_summary JSON,
    fraud_score DECIMAL(5,2),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_dispute_status (status),
    INDEX idx_dispute_delivery (delivery_id),
    INDEX idx_dispute_fraud (fraud_score)
);

CREATE TABLE IF NOT EXISTS fraud_patterns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    pattern_type ENUM('address', 'customer', 'driver', 'time', 'location') NOT NULL,
    pattern_data JSON NOT NULL,
    confidence_score DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_fraud_business (business_id, pattern_type)
);

CREATE TABLE IF NOT EXISTS blacklisted_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    address TEXT NOT NULL,
    reason VARCHAR(255),
    added_by INT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_blacklist_business (business_id)
);

CREATE TABLE IF NOT EXISTS languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    native_name VARCHAR(50) NOT NULL,
    is_rtl BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translation_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    default_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_translation_key (key_name),
    INDEX idx_translation_module (module)
);

CREATE TABLE IF NOT EXISTS translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_id INT NOT NULL,
    language_id INT NOT NULL,
    translated_text TEXT NOT NULL,
    created_by INT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (key_id) REFERENCES translation_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_language_key (key_id, language_id),
    INDEX idx_translation_language (language_id)
);

CREATE TABLE IF NOT EXISTS user_language_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_type ENUM('driver', 'manager', 'customer') NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    preferred_region VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (language_code) REFERENCES languages(code),
    UNIQUE KEY unique_user_language (user_id, user_type)
);

CREATE TABLE IF NOT EXISTS business_language_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    default_language_code VARCHAR(10) NOT NULL,
    supported_languages JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (default_language_code) REFERENCES languages(code)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT UNIQUE NOT NULL,
    stripe_subscription_id VARCHAR(255),
    plan_id VARCHAR(50) NOT NULL,
    status ENUM('active', 'past_due', 'canceled', 'incomplete') DEFAULT 'active',
    current_period_start DATE,
    current_period_end DATE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    invoice_number VARCHAR(50),
    amount_due DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    status ENUM('draft', 'open', 'paid', 'void', 'uncollectible') DEFAULT 'draft',
    invoice_pdf VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_invoice_business (business_id)
);

CREATE TABLE IF NOT EXISTS delivery_analytics_daily (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    date DATE NOT NULL,
    total_deliveries INT DEFAULT 0,
    successful_deliveries INT DEFAULT 0,
    failed_deliveries INT DEFAULT 0,
    disputed_deliveries INT DEFAULT 0,
    avg_delivery_time_minutes DECIMAL(10,2),
    total_distance_km DECIMAL(10,2),
    fraud_prevention_savings DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_business_date (business_id, date),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_analytics_date (date)
);

CREATE TABLE IF NOT EXISTS driver_performance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    driver_id INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_deliveries INT DEFAULT 0,
    on_time_rate DECIMAL(5,2),
    proof_score_avg DECIMAL(5,2),
    customer_rating_avg DECIMAL(3,2),
    disputes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    INDEX idx_performance_driver_period (driver_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT,
    user_id INT,
    user_type ENUM('driver', 'manager', 'customer', 'system'),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_business (business_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_timestamp (created_at)
);

-- Initial Data Seed
INSERT IGNORE INTO languages (code, name, native_name, is_rtl) VALUES
('en', 'English', 'English', FALSE),
('es', 'Spanish', 'Español', FALSE),
('fr', 'French', 'Français', FALSE),
('de', 'German', 'Deutsch', FALSE),
('pt', 'Portuguese', 'Português', FALSE),
('hi', 'Hindi', 'हिन्दी', FALSE),
('ar', 'Arabic', 'العربية', TRUE),
('zh', 'Chinese', '中文', FALSE);

INSERT IGNORE INTO translation_keys (key_name, module, default_text) VALUES
('status_scheduled', 'delivery', 'Scheduled'),
('status_dispatched', 'delivery', 'Dispatched'),
('status_en_route', 'delivery', 'En Route'),
('status_delivered', 'delivery', 'Delivered'),
('status_failed', 'delivery', 'Failed'),
('status_disputed', 'delivery', 'Disputed'),
('priority_low', 'delivery', 'Low'),
('priority_medium', 'delivery', 'Medium'),
('priority_high', 'delivery', 'High'),
('yes', 'common', 'Yes'),
('no', 'common', 'No');

-- ----------------------------------------------------------------------
-- Stored Procedures
-- ----------------------------------------------------------------------

DELIMITER //

CREATE PROCEDURE sp_complete_delivery_with_proof(
    IN p_delivery_uuid VARCHAR(36),
    IN p_driver_id INT,
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
    
    SELECT d.id, d.business_id, d.customer_id, d.requires_signature, d.requires_photo
    INTO v_delivery_id, v_business_id, v_customer_id, v_requires_signature, v_requires_photo
    FROM deliveries d
    JOIN drivers dr ON d.driver_id = dr.id
    WHERE d.uuid = p_delivery_uuid AND dr.user_id = p_driver_id
      AND d.delivery_status IN ('en_route', 'arrived')
    FOR UPDATE;
    
    IF v_delivery_id IS NULL THEN
        SET p_success = FALSE;
        SET p_proof_id = NULL;
        SET p_message = 'Delivery not found or not authorized';
        ROLLBACK;
        LEAVE proc_label;
    END IF;
    
    SET v_has_signature = JSON_EXTRACT(p_proof_data, '$.has_signature') = 1;
    SET v_has_photo = JSON_EXTRACT(p_proof_data, '$.has_photo') = 1;
    
    IF v_requires_signature AND NOT v_has_signature THEN
        SET p_success = FALSE;
        SET p_proof_id = NULL;
        SET p_message = 'Signature required';
        ROLLBACK;
        LEAVE proc_label;
    END IF;
    
    IF v_requires_photo AND NOT v_has_photo THEN
        SET p_success = FALSE;
        SET p_proof_id = NULL;
        SET p_message = 'Photo required';
        ROLLBACK;
        LEAVE proc_label;
    END IF;
    
    INSERT INTO delivery_proofs (
        delivery_id, proof_type, proof_data,
        verification_score, blockchain_tx_hash, created_at
    ) VALUES (
        v_delivery_id, 'comprehensive', p_proof_data,
        p_verification_score, p_blockchain_tx_hash, NOW()
    );
    
    SET p_proof_id = LAST_INSERT_ID();
    
    UPDATE deliveries
    SET delivery_status = 'delivered',
        actual_arrival = NOW(),
        updated_at = NOW()
    WHERE id = v_delivery_id;
    
    UPDATE drivers
    SET total_deliveries = total_deliveries + 1,
        last_location_lat = JSON_EXTRACT(p_proof_data, '$.gps_lat'),
        last_location_lng = JSON_EXTRACT(p_proof_data, '$.gps_lng'),
        last_location_update = NOW()
    WHERE user_id = p_driver_id;
    
    UPDATE customers
    SET total_orders = total_orders + 1
    WHERE id = v_customer_id;
    
    INSERT INTO audit_logs (
        business_id, user_id, user_type, action,
        entity_type, entity_id, new_values
    ) VALUES (
        v_business_id, p_driver_id, 'driver', 'DELIVERY_COMPLETED',
        'delivery', v_delivery_id,
        JSON_OBJECT('proof_id', p_proof_id, 'score', p_verification_score)
    );
    
    SET p_success = TRUE;
    SET p_message = 'Delivery completed successfully';
    COMMIT;
END //

CREATE PROCEDURE sp_get_driver_today_deliveries_i18n(
    IN p_driver_id INT,
    IN p_language_code VARCHAR(10)
)
BEGIN
    SELECT
        d.uuid,
        d.order_number,
        d.delivery_status,
        d.scheduled_time,
        d.priority_level,
        d.requires_signature,
        d.requires_photo,
        d.route_optimization_data,
        c.name AS customer_name,
        c.address,
        ST_X(c.location) AS address_lat,
        ST_Y(c.location) AS address_lng,
        c.delivery_instructions,
        c.preferred_language_code,
        COALESCE((
            SELECT t.translated_text
            FROM translations t
            JOIN translation_keys tk ON t.key_id = tk.id
            JOIN languages l ON t.language_id = l.id
            WHERE tk.key_name = CONCAT('status_', d.delivery_status)
              AND tk.module = 'delivery'
              AND l.code = p_language_code
        ), d.delivery_status) AS status_display,
        TIMESTAMPDIFF(MINUTE, NOW(), d.scheduled_time) AS minutes_until,
        ST_Distance_Sphere(
            point(dr.last_location_lng, dr.last_location_lat),
            c.location
        ) / 1000 AS distance_km
    FROM deliveries d
    JOIN customers c ON d.customer_id = c.id
    JOIN drivers dr ON d.driver_id = dr.id
    WHERE dr.user_id = p_driver_id
      AND DATE(d.scheduled_time) = CURDATE()
      AND d.delivery_status IN ('scheduled', 'dispatched', 'en_route')
    ORDER BY
        FIELD(d.priority_level, 'high', 'medium', 'low'),
        d.scheduled_time ASC;
END //

DELIMITER ;

