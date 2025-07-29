import { z } from "zod";

// Base validation schemas
const emailSchema = z.string().email("Please enter a valid email address");
const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registrationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  backupEmail: emailSchema,
  adminEmail: emailSchema,
  adminFirstName: z.string().min(1, "First name is required"),
  adminLastName: z.string().min(1, "Last name is required"),
  password: passwordSchema,
  plan: z.enum(["starter", "business", "enterprise"]),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: emailSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "employee"]),
  companyId: z.string(),
  status: z.enum(["active", "inactive"]),
  lastLogin: z.date().optional(),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: emailSchema.optional(),
});

// Company schemas
export const companySchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Company name must be at least 2 characters"),
  domain: z.string().regex(domainRegex, "Please enter a valid domain name"),
  plan: z.enum(["starter", "business", "enterprise"]),
  status: z.enum(["active", "suspended", "pending"]),
  createdAt: z.date(),
});

export const companyUpdateSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").optional(),
});

// Email account schemas
export const emailAccountSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  department: z.string().optional(),
});

export const emailAccountCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userId: z.string(),
});

export const bulkEmailAccountSchema = z.object({
  accounts: z.array(z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userId: z.string(),
  })).min(1, "At least one account is required"),
});

// Email message schemas
export const emailComposeSchema = z.object({
  to: z.string().min(1, "At least one recipient is required"),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
});

export const emailSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  folder: z.enum(["inbox", "sent", "drafts", "spam", "trash"]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export const emailMoveSchema = z.object({
  emailId: z.string(),
  folder: z.enum(["inbox", "sent", "drafts", "spam", "trash"]),
});

// Domain schemas
export const domainSchema = z.object({
  name: z.string().regex(
    domainRegex,
    "Please enter a valid domain name"
  ),
});

export const domainAddSchema = z.object({
  name: z.string().regex(domainRegex, "Please enter a valid domain name"),
  companyId: z.string(),
});

export const dnsRecordSchema = z.object({
  type: z.enum(["MX", "TXT", "CNAME", "A"]),
  name: z.string().min(1, "DNS record name is required"),
  value: z.string().min(1, "DNS record value is required"),
  priority: z.number().optional(),
});

// Company settings schemas
export const companySettingsSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  maxEmailAccounts: z.number().min(1, "Must allow at least 1 email account"),
  storageLimit: z.number().min(1, "Storage limit must be at least 1 GB"),
});

export const securitySettingsSchema = z.object({
  passwordPolicy: z.object({
    minLength: z.number().min(6, "Minimum length must be at least 6").max(128),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
  }),
  twoFactorRequired: z.boolean(),
  sessionTimeout: z.number().min(15, "Session timeout must be at least 15 minutes"),
});

// Billing schemas
export const subscriptionSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  plan: z.enum(["starter", "business", "enterprise"]),
  status: z.enum(["active", "cancelled", "past_due"]),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
});

export const planUpgradeSchema = z.object({
  newPlan: z.enum(["starter", "business", "enterprise"]),
});

export const paymentMethodSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits"),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
  cvv: z.string().min(3, "CVV must be at least 3 digits"),
  cardholderName: z.string().min(1, "Cardholder name is required"),
});

// Forwarding rule schemas
export const forwardingRuleSchema = z.object({
  fromAddress: emailSchema,
  toAddress: emailSchema,
  isActive: z.boolean().default(true),
});

export const forwardingRuleCreateSchema = z.object({
  emailAccountId: z.string(),
  fromAddress: emailSchema,
  toAddress: emailSchema,
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB default
  allowedTypes: z.array(z.string()).default([
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]),
});

// Contact schemas
export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailSchema,
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export const contactGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  contactIds: z.array(z.string()),
});

// Validation utility functions
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validateDomain(domain: string): boolean {
  return domainRegex.test(domain);
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function validateFileSize(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
  return file.size <= maxSize;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type CompanyUpdateFormData = z.infer<typeof companyUpdateSchema>;
export type EmailAccountFormData = z.infer<typeof emailAccountSchema>;
export type EmailAccountCreateFormData = z.infer<typeof emailAccountCreateSchema>;
export type BulkEmailAccountFormData = z.infer<typeof bulkEmailAccountSchema>;
export type EmailComposeFormData = z.infer<typeof emailComposeSchema>;
export type EmailSearchFormData = z.infer<typeof emailSearchSchema>;
export type EmailMoveFormData = z.infer<typeof emailMoveSchema>;
export type DomainFormData = z.infer<typeof domainSchema>;
export type DomainAddFormData = z.infer<typeof domainAddSchema>;
export type DNSRecordFormData = z.infer<typeof dnsRecordSchema>;
export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
export type PlanUpgradeFormData = z.infer<typeof planUpgradeSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
export type ForwardingRuleFormData = z.infer<typeof forwardingRuleSchema>;
export type ForwardingRuleCreateFormData = z.infer<typeof forwardingRuleCreateSchema>;
export type PaginationFormData = z.infer<typeof paginationSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ContactGroupFormData = z.infer<typeof contactGroupSchema>;