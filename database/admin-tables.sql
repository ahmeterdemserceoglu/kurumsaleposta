-- Admin system tables

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'Email Marketing Platform',
    site_description TEXT,
    maintenance_mode BOOLEAN DEFAULT false,
    max_login_attempts INTEGER DEFAULT 5,
    session_timeout INTEGER DEFAULT 1440, -- minutes
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    target VARCHAR(50) DEFAULT 'all' CHECK (target IN ('all', 'admins', 'users', 'company')),
    target_id UUID, -- company_id if target is 'company'
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets table (if not exists)
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('technical', 'billing', 'general', 'feature_request')),
    assigned_to UUID, -- admin user id
    assigned_admin_name VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to payments table if they don't exist
DO $$ 
BEGIN
    -- Add refund columns to payments table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'refund_reason') THEN
        ALTER TABLE payments ADD COLUMN refund_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'refunded_at') THEN
        ALTER TABLE payments ADD COLUMN refunded_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add missing columns to companies table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'phone') THEN
        ALTER TABLE companies ADD COLUMN phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'website') THEN
        ALTER TABLE companies ADD COLUMN website VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'industry') THEN
        ALTER TABLE companies ADD COLUMN industry VARCHAR(100) DEFAULT 'other';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'size') THEN
        ALTER TABLE companies ADD COLUMN size VARCHAR(50) DEFAULT 'small' CHECK (size IN ('small', 'medium', 'large', 'enterprise'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'status') THEN
        ALTER TABLE companies ADD COLUMN status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'suspension_reason') THEN
        ALTER TABLE companies ADD COLUMN suspension_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'suspended_at') THEN
        ALTER TABLE companies ADD COLUMN suspended_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'admin_notes') THEN
        ALTER TABLE companies ADD COLUMN admin_notes TEXT;
    END IF;

    -- Add missing columns to users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_target ON admin_notifications(target, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- Insert default system settings
INSERT INTO system_settings (
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
) ON CONFLICT DO NOTHING;

-- Create some sample admin notifications
INSERT INTO admin_notifications (title, message, type, target, created_by) VALUES
('Sistem Güncellemesi', 'Sistem başarıyla güncellendi. Yeni özellikler aktif.', 'success', 'admins', 'system'),
('Bakım Bildirimi', 'Yarın gece 02:00-04:00 arası bakım çalışması yapılacaktır.', 'warning', 'all', 'admin'),
('Yeni Özellik', 'Gelişmiş raporlama modülü eklendi.', 'info', 'all', 'admin')
ON CONFLICT DO NOTHING;

-- Create some sample support tickets (optional)
INSERT INTO support_tickets (
    company_id, 
    user_id, 
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
JOIN users u ON u.company_id = c.id
LIMIT 1
ON CONFLICT DO NOTHING;