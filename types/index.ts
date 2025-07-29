// Core data models for the Corporate Email Hosting platform

export interface Company {
  id: string;
  name: string;
  domain: string;
  backupEmail: string;
  plan: 'starter' | 'business' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  settings: CompanySettings;
}

export interface CompanySettings {
  maxEmailAccounts: number;
  storageLimit: number;
  securitySettings: SecuritySettings;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  twoFactorRequired: boolean;
  sessionTimeout: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee';
  companyId: string;
  status: 'active' | 'inactive';
  lastLogin?: Date;
}

export interface EmailAccount {
  id: string;
  email: string;
  userId: string;
  companyId: string;
  forwardingRules: ForwardingRule[];
  storageUsed: number;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface ForwardingRule {
  id: string;
  fromAddress: string;
  toAddress: string;
  isActive: boolean;
}

export interface EmailMessage {
  id: string;
  messageId?: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments: Attachment[];
  folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';
  isRead: boolean;
  timestamp: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface Domain {
  id: string;
  name: string;
  companyId: string;
  status: 'verified' | 'pending' | 'failed';
  dnsRecords: DNSRecord[];
  verificationToken: string;
}

export interface DNSRecord {
  type: 'MX' | 'TXT' | 'CNAME' | 'A';
  name: string;
  value: string;
  priority?: number;
}

export interface Subscription {
  id: string;
  companyId: string;
  plan: PricingPlan;
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  usage: UsageMetrics;
}

export interface PricingPlan {
  id: string;
  name: 'starter' | 'business' | 'enterprise';
  price: number;
  features: PlanFeature[];
  limits: PlanLimits;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  maxEmailAccounts: number;
  storagePerAccount: number;
  totalStorage: number;
  maxDomains: number;
}

export interface UsageMetrics {
  emailsSent: number;
  emailsReceived: number;
  storageUsed: number;
  activeAccounts: number;
}

// API Response types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ErrorResponse {
  error: APIError;
  requestId: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  companyName: string;
  backupEmail: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  password: string;
  plan: 'starter' | 'business' | 'enterprise';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

// Form types
export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: File[];
}

export interface Pagination {
  page: number;
  limit: number;
  total?: number;
}

// Utility types
export type UserRole = User['role'];
export type CompanyStatus = Company['status'];
export type EmailFolder = EmailMessage['folder'];
export type DomainStatus = Domain['status'];
export type SubscriptionStatus = Subscription['status'];