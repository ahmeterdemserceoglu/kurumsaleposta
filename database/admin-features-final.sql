-- Admin Panel Final Düzeltme SQL'i
-- Son hataları düzeltir

-- 1. Subscriptions tablosunu kontrol et ve eksik kolonları ekle
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER plan,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'TRY' AFTER price,
ADD COLUMN IF NOT EXISTS billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly' AFTER currency;

-- 2. Payments tablosunu kontrol et (eğer yoksa oluştur)
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

-- 3. Test verisi ekle (düzeltilmiş)
INSERT IGNORE INTO subscriptions (companyId, plan, price, currency, billing_cycle, status, starts_at, ends_at) VALUES
(1, 'business', 299.00, 'TRY', 'monthly', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH));

-- 4. Payment test verisi ekle
INSERT IGNORE INTO payments (companyId, subscriptionId, amount, currency, status, payment_method, transaction_id, paid_at) VALUES
(1, (SELECT id FROM subscriptions WHERE companyId = 1 LIMIT 1), 299.00, 'TRY', 'completed', 'credit_card', 'TXN_123456789', NOW());

-- 5. Mevcut subscriptions tablosundaki verileri güncelle (eğer price NULL ise)
UPDATE subscriptions SET 
    price = CASE 
        WHEN plan = 'starter' THEN 99.00
        WHEN plan = 'business' THEN 299.00
        WHEN plan = 'enterprise' THEN 799.00
        ELSE 99.00
    END
WHERE price IS NULL OR price = 0;

-- 6. Admin kullanıcının şirket bilgilerini kontrol et
UPDATE companies SET 
    plan = 'enterprise',
    status = 'active'
WHERE id = 1;

-- 7. Sistem ayarlarını ekle (eğer yoksa)
INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'İnf İletişim', 'string', 'Site adı', true),
('site_description', 'Profesyonel E-posta Barındırma Hizmetleri', 'string', 'Site açıklaması', true),
('maintenance_mode', 'false', 'boolean', 'Bakım modu', false),
('max_login_attempts', '5', 'number', 'Maksimum giriş denemesi', false),
('session_timeout', '480', 'number', 'Oturum zaman aşımı (dakika)', false),
('email_verification_required', 'true', 'boolean', 'E-posta doğrulama zorunlu', false),
('default_plan', 'starter', 'string', 'Varsayılan plan', false),
('trial_period_days', '14', 'number', 'Deneme süresi (gün)', false);

-- 8. Dashboard view'ını yeniden oluştur (hatasız)
DROP VIEW IF EXISTS admin_dashboard_stats;
CREATE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
    (SELECT COUNT(*) FROM companies WHERE status = 'active') as total_companies,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')) as open_tickets,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND DATE(createdAt) = CURDATE()) as today_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE())) as monthly_revenue;

-- 9. Tabloları kontrol et
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'system_settings', COUNT(*) FROM system_settings;

-- 10. Admin kullanıcı bilgilerini göster
SELECT 
    id, email, firstName, lastName, role, status, is_banned,
    companyId, createdAt
FROM users 
WHERE role IN ('admin', 'super_admin');

-- 11. Dashboard istatistiklerini test et
SELECT * FROM admin_dashboard_stats;