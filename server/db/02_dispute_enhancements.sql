-- Dispute & Fraud Investigation Module Enhancements
-- MySQL 8.0+

-- 1. Add uuid to disputes if it doesn't exist
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS uuid VARCHAR(36) UNIQUE NOT NULL AFTER id;

-- 2. Update existing rows with UUIDs if they are empty (for MySQL, we might need a stored procedure or just use UUID())
SET @SQL_EXIST = (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'disputes' AND column_name = 'uuid');
-- (Assume we run this on a fresh enough DB or we can handle it in JS)

-- 3. Add ai_explanation to disputes
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS ai_explanation TEXT AFTER fraud_score;

-- 4. Expand user types
ALTER TABLE users MODIFY COLUMN user_type ENUM('driver', 'manager', 'admin', 'analyst', 'support') NOT NULL;

-- 5. Dispute Comments Table
CREATE TABLE IF NOT EXISTS dispute_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    dispute_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comment_dispute (dispute_id),
    INDEX idx_comment_user (user_id)
);

-- 6. Add "Fraud" as a status for deliveries if not exists (already exists in enum for disputes, but maybe for deliveries too?)
-- No, 'disputed' is already in deliveries.

-- 7. Add internal_notes to disputes for resolution
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS internal_notes TEXT AFTER resolution;

-- 8. Ensure some initial dispute data has UUIDs for testing
UPDATE disputes SET uuid = UUID() WHERE uuid IS NULL OR uuid = '';
