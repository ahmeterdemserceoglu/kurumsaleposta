-- Admin Panel Düzeltme SQL'i
-- Sadece eksik olan kolonları ve tabloları ekler

-- 1. Users tablosuna eksik kolonları ekle (role zaten var)
ALTER TABLE users 
ADD COLUMN is_banned BOOLEAN DEFAULT FALSE AFTER role,
ADD COLUMN ban_reason TEXT NULL AFTER is_banned,
ADD COLUMN banned_at TIMESTAMP NULL AFTER ban_reason,
ADD COLUMN banned_by INT NULL AFTER banned_at,
ADD COLUMN last_login TIMESTAMP NULL AFTER banned_by,
ADD COLUMN login_attempts INT DEFAULT 0 AFTER last_login,
ADD COLUMN locked_until TIMESTAMP NULL AFTER login_attempts;

-- 2. Role enum'unu güncelle (mevcut değerleri koruyarak)
ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'super_admin') DEFAULT 'user';

-- 3. Eksik index'leri ekle
CREATE INDEX idx_users_last_login ON users(last_login);

-- 4. Payments tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    companyId INT NOT NULL,
    subscriptionId INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('credit_card', 'bank_transfer', 'paypal') NOT NULL,
    transaction_id VARCHAR(255) NULL,
    gateway VARCHAR(50) NULL,
    gateway_response TEXT NULL,
    description TEXT NULL,
    paid_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    refund_reason TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id) ON DELETE SET NULL,
    INDEX idx_company_status (companyId, status),
    INDEX idx_transaction (transaction_id),
    INDEX idx_created_at (createdAt)
);

-- 5. Admin Activity Log tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type ENUM('user', 'company', 'subscription', 'payment') NOT NULL,
    target_id INT NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_action (admin_id, action),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created_at (createdAt)
);

-- 6. System Settings tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    updatedBy INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key_public (setting_key, is_public)
);

-- 7. Support Tickets tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    companyId INT NOT NULL,
    userId INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category ENUM('technical', 'billing', 'general', 'feature_request') DEFAULT 'general',
    assigned_to INT NULL,
    resolved_at TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_company_status (companyId, status),
    INDEX idx_assigned (assigned_to),
    INDEX idx_created_at (createdAt)
);

-- 8. Support Ticket Messages tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticketId INT NOT NULL,
    userId INT NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSON NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticketId) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ticket_created (ticketId, createdAt)
);

-- 9. Email Usage Stats tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS email_usage_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    companyId INT NOT NULL,
    date DATE NOT NULL,
    emails_sent INT DEFAULT 0,
    emails_received INT DEFAULT 0,
    storage_used BIGINT DEFAULT 0,
    bandwidth_used BIGINT DEFAULT 0,
    active_accounts INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_company_date (companyId, date),
    INDEX idx_date (date)
);

-- 10. Admin kullanıcı oluştur (super_admin rolü ile)
INSERT IGNORE INTO users (email, firstName, lastName, password, role, companyId, status, createdAt) 
VALUES (
    'admin@infiletisim.com', 
    'Admin', 
    'User', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', -- password: admin123
    'super_admin', 
    1, 
    'active', 
    NOW()
);

-- 11. Mevcut kullanıcıları admin yap (isteğe bağlı)
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@domain.com';

-- 12. Dashboard view'ını yeniden oluştur
DROP VIEW IF EXISTS admin_dashboard_stats;
CREATE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
    (SELECT COUNT(*) FROM companies WHERE status = 'active') as total_companies,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')) as open_tickets,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND DATE(createdAt) = CURDATE()) as today_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE())) as monthly_revenue;

-- 13. Trigger'ları yeniden oluştur
DROP TRIGGER IF EXISTS user_ban_log;
DROP TRIGGER IF EXISTS company_suspension_log;

DELIMITER //

CREATE TRIGGER user_ban_log 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.is_banned != NEW.is_banned AND NEW.is_banned = TRUE THEN
        INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, description, createdAt)
        VALUES (COALESCE(NEW.banned_by, 1), 'ban_user', 'user', NEW.id, CONCAT('User banned: ', COALESCE(NEW.ban_reason, 'No reason')), NOW());
    END IF;
END//

CREATE TRIGGER company_suspension_log
AFTER UPDATE ON companies  
FOR EACH ROW
BEGIN
    IF OLD.is_suspended != NEW.is_suspended AND NEW.is_suspended = TRUE THEN
        INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, description, createdAt)
        VALUES (COALESCE(NEW.suspended_by, 1), 'suspend_company', 'company', NEW.id, CONCAT('Company suspended: ', COALESCE(NEW.suspension_reason, 'No reason')), NOW());
    END IF;
END//

DELIMITER ;

-- 14. Test verisi ekle (isteğe bağlı)
INSERT IGNORE INTO subscriptions (companyId, plan, price, billing_cycle, starts_at, ends_at) VALUES
(1, 'business', 299.00, 'monthly', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH));

INSERT IGNORE INTO payments (companyId, subscriptionId, amount, status, payment_method, transaction_id, paid_at) VALUES
(1, 1, 299.00, 'completed', 'credit_card', 'TXN_123456789', NOW());