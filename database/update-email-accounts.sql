-- Add forwardingRules column to email_accounts table
ALTER TABLE email_accounts 
ADD COLUMN forwardingRules JSON NOT NULL DEFAULT '[]' 
AFTER companyId;