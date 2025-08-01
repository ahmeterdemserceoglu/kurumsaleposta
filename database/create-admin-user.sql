-- Admin kullanıcı oluşturma veya mevcut kullanıcıyı admin yapma

-- 1. Mevcut kullanıcıları listele
SELECT id, email, firstName, lastName, role, status FROM users;

-- 2. Belirli bir kullanıcıyı admin yap (email adresini değiştir)
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@domain.com';

-- 3. Veya yeni admin kullanıcı oluştur
INSERT IGNORE INTO users (
    email, 
    firstName, 
    lastName, 
    password, 
    role, 
    companyId, 
    status, 
    createdAt
) VALUES (
    'admin@infiletisim.com',
    'Admin',
    'User', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK', -- password: admin123
    'super_admin',
    1,
    'active',
    NOW()
);

-- 4. Admin kullanıcıları kontrol et
SELECT id, email, firstName, lastName, role, status, companyId FROM users WHERE role IN ('admin', 'super_admin');

-- 5. Test için bir şirket oluştur (eğer yoksa)
INSERT IGNORE INTO companies (
    id,
    name,
    domain,
    backupEmail,
    plan,
    status,
    createdAt
) VALUES (
    1,
    'İnf İletişim',
    'infiletisim.com',
    'admin@infiletisim.com',
    'enterprise',
    'active',
    NOW()
);