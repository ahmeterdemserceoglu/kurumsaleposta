-- Corporate Email Hosting Database Schema

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    backupEmail VARCHAR(255) NOT NULL,
    plan ENUM('starter', 'business', 'enterprise') NOT NULL DEFAULT 'starter',
    status ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domain (domain),
    INDEX idx_backup_email (backupEmail),
    INDEX idx_status (status)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
    companyId INT NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    lastLogin TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_company (companyId),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Company settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companyId INT NOT NULL UNIQUE,
    maxEmailAccounts INT NOT NULL DEFAULT 10,
    storageLimit INT NOT NULL DEFAULT 10, -- in GB
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Security settings table
CREATE TABLE IF NOT EXISTS security_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companyId INT NOT NULL UNIQUE,
    passwordMinLength INT NOT NULL DEFAULT 8,
    requireUppercase BOOLEAN NOT NULL DEFAULT TRUE,
    requireLowercase BOOLEAN NOT NULL DEFAULT TRUE,
    requireNumbers BOOLEAN NOT NULL DEFAULT TRUE,
    requireSpecialChars BOOLEAN NOT NULL DEFAULT FALSE,
    twoFactorRequired BOOLEAN NOT NULL DEFAULT FALSE,
    sessionTimeout INT NOT NULL DEFAULT 480, -- in minutes
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (userId),
    INDEX idx_expires (expiresAt)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expiresAt)
);

-- Email accounts table
CREATE TABLE IF NOT EXISTS email_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    userId INT NOT NULL,
    companyId INT NOT NULL,
    forwardingRules JSON NOT NULL DEFAULT '[]',
    storageUsed BIGINT NOT NULL DEFAULT 0, -- in bytes
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_user (userId),
    INDEX idx_company (companyId),
    INDEX idx_status (status)
);

-- Forwarding rules table
CREATE TABLE IF NOT EXISTS forwarding_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emailAccountId INT NOT NULL,
    fromAddress VARCHAR(255) NOT NULL,
    toAddress VARCHAR(255) NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emailAccountId) REFERENCES email_accounts(id) ON DELETE CASCADE,
    INDEX idx_email_account (emailAccountId),
    INDEX idx_from_address (fromAddress),
    INDEX idx_active (isActive)
);

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    companyId INT NOT NULL,
    status ENUM('verified', 'pending', 'failed') NOT NULL DEFAULT 'pending',
    verificationToken VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_company (companyId),
    INDEX idx_status (status)
);

-- DNS records table
CREATE TABLE IF NOT EXISTS dns_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domainId INT NOT NULL,
    type ENUM('MX', 'TXT', 'CNAME', 'A') NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    priority INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (domainId) REFERENCES domains(id) ON DELETE CASCADE,
    INDEX idx_domain (domainId),
    INDEX idx_type (type)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companyId INT NOT NULL UNIQUE,
    plan ENUM('starter', 'business', 'enterprise') NOT NULL,
    status ENUM('active', 'cancelled', 'past_due') NOT NULL DEFAULT 'active',
    currentPeriodStart TIMESTAMP NOT NULL,
    currentPeriodEnd TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (companyId),
    INDEX idx_status (status)
);

-- Usage metrics table
CREATE TABLE IF NOT EXISTS usage_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companyId INT NOT NULL,
    emailsSent INT NOT NULL DEFAULT 0,
    emailsReceived INT NOT NULL DEFAULT 0,
    storageUsed BIGINT NOT NULL DEFAULT 0, -- in bytes
    activeAccounts INT NOT NULL DEFAULT 0,
    recordDate DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_company_date (companyId, recordDate),
    INDEX idx_company (companyId),
    INDEX idx_date (recordDate)
);

-- Email messages table (simplified for basic functionality)
CREATE TABLE IF NOT EXISTS email_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emailAccountId INT NOT NULL,
    messageId VARCHAR(255) NOT NULL UNIQUE,
    fromAddress VARCHAR(255) NOT NULL,
    toAddresses JSON NOT NULL,
    ccAddresses JSON NULL,
    bccAddresses JSON NULL,
    subject TEXT NOT NULL,
    body LONGTEXT NOT NULL,
    folder ENUM('inbox', 'sent', 'drafts', 'spam', 'trash') NOT NULL DEFAULT 'inbox',
    isRead BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emailAccountId) REFERENCES email_accounts(id) ON DELETE CASCADE,
    INDEX idx_email_account (emailAccountId),
    INDEX idx_folder (folder),
    INDEX idx_timestamp (timestamp),
    INDEX idx_read (isRead)
);

-- Email attachments table
CREATE TABLE IF NOT EXISTS email_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emailMessageId INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emailMessageId) REFERENCES email_messages(id) ON DELETE CASCADE,
    INDEX idx_email_message (emailMessageId)
);

-- Clean up expired tokens (run this periodically)
-- DELETE FROM refresh_tokens WHERE expiresAt < NOW();
-- DELETE FROM password_reset_tokens WHERE expiresAt < NOW();