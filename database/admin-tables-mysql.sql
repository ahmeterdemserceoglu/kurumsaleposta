-- Admin system tables for MySQL/MariaDB

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'Email Marketing Platform',
    site_description TEXT,
    maintenance_mode BOOLEAN DEFAULT false,
    max_login_attempts INTEGER DEFAULT 5,
    session_timeout INTEGER DEFAULT 1440,
    email_verification_required BOOLEAN DEFAULT true,
    default_plan VARCHAR(50) DEFAULT 'starter',
    trial_period_days INTEGER DEFAULT 14,
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_user VARCHAR(255),
    smtp_from VARCHAR(255),
    backup_enabled BOOLEAN DEFAULT true,
    backup_frequency VARCHAR(50) DEFAULT 'daily',
    log_level VARCHAR(50) DEFAULT 'info',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    target VARCHAR(50) DEFAULT 'all',
    targetId INT NULL,
    isRead BOOLEAN DEFAULT false,
    readAt TIMESTAMP NULL,
    createdBy VARCHAR(255) NOT NULL,
    expiresAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (type IN ('info', 'warning', 'error', 'success')),
    CHECK (target IN ('all', 'admins', 'users', 'company')),
    FOREIGN KEY (targetId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companyId INT NOT NULL,
    userId INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'medium',
    category VARCHAR(50) DEFAULT 'general',
    assignedTo INT NULL,
    assignedAdminName VARCHAR(255),
    resolvedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CHECK (category IN ('technical', 'billing', 'general', 'feature_request')),
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Add missing columns to companies table (ignore errors if columns already exist)
ALTER TABLE companies 
ADD COLUMN phone VARCHAR(50),
ADD COLUMN website VARCHAR(255),
ADD COLUMN industry VARCHAR(100) DEFAULT 'other',
ADD COLUMN size VARCHAR(50) DEFAULT 'small',
ADD COLUMN suspension_reason TEXT,
ADD COLUMN suspended_at TIMESTAMP NULL,
ADD COLUMN admin_notes TEXT;

-- Add missing columns to users table (ignore errors if columns already exist)
ALTER TABLE users 
ADD COLUMN last_login_at TIMESTAMP NULL,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Create indexes for better performance (only if tables exist)
CREATE INDEX IF NOT EXISTS idx_admin_notifications_target ON admin_notifications(target, targetId);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(createdAt);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assignedTo);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(createdAt);

-- Insert default system settings
INSERT IGNORE INTO system_settings (
    site_name,
    site_description,
    maintenance_mode,
    max_login_attempts,
    session_timeout,
    email_verification_required,
    default_plan,
    trial_period_days,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_from,
    backup_enabled,
    backup_frequency,
    log_level
) VALUES (
    'Email Marketing Platform',
    'Professional email marketing solution for businesses',
    false,
    5,
    1440,
    true,
    'starter',
    14,
    'smtp.gmail.com',
    587,
    '',
    'noreply@yourplatform.com',
    true,
    'daily',
    'info'
);

-- Create some sample admin notifications
INSERT IGNORE INTO admin_notifications (title, message, type, target, createdBy) VALUES
('Sistem Güncellemesi', 'Sistem başarıyla güncellendi. Yeni özellikler aktif.', 'success', 'admins', 'system'),
('Bakım Bildirimi', 'Yarın gece 02:00-04:00 arası bakım çalışması yapılacaktır.', 'warning', 'all', 'admin'),
('Yeni Özellik', 'Gelişmiş raporlama modülü eklendi.', 'info', 'all', 'admin');

-- Create some sample support tickets (optional, only if companies and users exist)
INSERT IGNORE INTO support_tickets (
    companyId, 
    userId, 
    subject, 
    description, 
    status, 
    priority, 
    category
) 
SELECT 
    c.id,
    u.id,
    'E-posta gönderim sorunu',
    'E-postalarım gönderilmiyor, lütfen kontrol edebilir misiniz?',
    'open',
    'high',
    'technical'
FROM companies c
JOIN users u ON u.companyId = c.id
LIMIT 1;