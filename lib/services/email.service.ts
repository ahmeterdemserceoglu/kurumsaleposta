import { apiClient } from '../api'
import {
  EmailMessage,
  EmailAccount,
  EmailDraft,
  ForwardingRule,
  Pagination,
  Attachment,
  User,
  Company
} from '@/types'
import {
  EmailAccountsStorage,
  UsersStorage,
  CompanyStorage,
  SubscriptionStorage,
  SessionStorage
} from '../storage/localStorage'

export class EmailAPIService {
  // Email Account Management
  static async getEmailAccounts(companyId: string, pagination?: Pagination): Promise<{
    accounts: EmailAccount[]
    total: number
    page: number
    limit: number
  }> {
    const params: Record<string, string> = {
      companyId: companyId.toString()
    }

    if (pagination) {
      params.page = pagination.page.toString()
      params.limit = pagination.limit.toString()
    }

    console.log('EmailAPIService - Calling API with params:', params); // Debug log

    try {
      return await apiClient.get(`/emails/accounts`, params)
    } catch (error) {
      console.error('EmailAPIService - API call failed:', error)
      throw error
    }
  }

  // Create email account
  static async createEmailAccount(data: {
    email: string
    userId: string
    companyId: string
  }): Promise<{ success: boolean; account?: EmailAccount; message?: string }> {
    try {
      const response = await fetch('/api/emails/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to create email account' };
      }

      return { success: true, account: result.account };
    } catch (error) {
      return { success: false, message: 'Network error occurred' };
    }
  }

  static async sendEmail(data: {
    fromAccountId: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    attachments?: any[];
  }): Promise<{ success: boolean; message?: string; data?: EmailMessage }> {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to send email' };
      }

      return { success: true, data: result.data, message: result.message };
    } catch (error) {
      return { success: false, message: 'Network error occurred' };
    }
  }

  static async sendNewEmail(data: {
    fromAccountId: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    attachments?: any[];
  }): Promise<{ success: boolean; message?: string; data?: EmailMessage }> {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to send email' };
      }

      return { success: true, data: result.data, message: result.message };
    } catch (error) {
      return { success: false, message: 'Network error occurred' };
    }
  }

  // Create multiple email accounts
  static async createBulkEmailAccounts(accounts: Array<{
    firstName: string
    lastName: string
    userId: string
  }>): Promise<EmailAccount[]> {
    return apiClient.post<EmailAccount[]>('/emails/accounts/bulk', { accounts })
  }

  // Update email account
  static async updateEmailAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount> {
    return apiClient.patch<EmailAccount>(`/emails/accounts/${id}`, updates)
  }

  // Delete email account
  static async deleteEmailAccount(id: string): Promise<void> {
    return apiClient.delete<void>(`/emails/accounts/${id}`)
  }

  // Get email account details
  static async getEmailAccount(id: string): Promise<EmailAccount> {
    return apiClient.get<EmailAccount>(`/emails/accounts/${id}`)
  }

  // Email Message Management
  static async getEmails(
    accountId: string,
    folder: string = 'inbox',
    pagination?: Pagination
  ): Promise<{
    emails: EmailMessage[]
    total: number
    page: number
    limit: number
  }> {
    const params = {
      folder,
      ...(pagination ? {
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      } : {})
    }

    return apiClient.get(`/emails/messages`, params)
  }

  // Get single email
  static async getEmail(id: string): Promise<EmailMessage> {
    return apiClient.get<EmailMessage>(`/emails/messages/${id}`)
  }

  // Send email (legacy method - use sendNewEmail instead)
  static async sendEmailLegacy(draft: EmailDraft): Promise<EmailMessage> {
    return apiClient.post<EmailMessage>('/emails/send', draft)
  }

  // Save draft
  static async saveDraft(draft: Partial<EmailDraft>): Promise<EmailMessage> {
    return apiClient.post<EmailMessage>('/emails/drafts', draft)
  }

  // Update draft
  static async updateDraft(id: string, draft: Partial<EmailDraft>): Promise<EmailMessage> {
    return apiClient.patch<EmailMessage>(`/emails/drafts/${id}`, draft)
  }

  // Delete email
  static async deleteEmail(id: string): Promise<void> {
    return apiClient.delete<void>(`/emails/messages/${id}`)
  }

  // Move email to folder
  static async moveEmail(id: string, folder: string): Promise<EmailMessage> {
    return apiClient.patch<EmailMessage>(`/emails/messages/${id}/move`, { folder })
  }

  // Mark email as read/unread
  static async markEmailAsRead(id: string, isRead: boolean = true): Promise<EmailMessage> {
    return apiClient.patch<EmailMessage>(`/emails/messages/${id}/read`, { isRead })
  }

  // Search emails
  static async searchEmails(query: string, options?: {
    folder?: string
    dateFrom?: Date
    dateTo?: Date
    pagination?: Pagination
  }): Promise<{
    emails: EmailMessage[]
    total: number
    page: number
    limit: number
  }> {
    const params = {
      q: query,
      ...(options?.folder && { folder: options.folder }),
      ...(options?.dateFrom && { dateFrom: options.dateFrom.toISOString() }),
      ...(options?.dateTo && { dateTo: options.dateTo.toISOString() }),
      ...(options?.pagination ? {
        page: options.pagination.page.toString(),
        limit: options.pagination.limit.toString()
      } : {})
    }

    return apiClient.get('/emails/search', params)
  }

  // Get email folders
  static async getFolders(): Promise<Array<{
    name: string
    count: number
    type: 'system' | 'custom'
  }>> {
    return apiClient.get<Array<{
      name: string
      count: number
      type: 'system' | 'custom'
    }>>('/emails/folders')
  }

  // Create custom folder
  static async createFolder(name: string): Promise<void> {
    return apiClient.post<void>('/emails/folders', { name })
  }

  // Delete custom folder
  static async deleteFolder(name: string): Promise<void> {
    return apiClient.delete<void>(`/emails/folders/${encodeURIComponent(name)}`)
  }

  // Attachment Management
  static async uploadAttachment(file: File): Promise<Attachment> {
    return apiClient.uploadFile<Attachment>('/emails/attachments', file)
  }

  // Download attachment
  static async downloadAttachment(id: string): Promise<Blob> {
    const response = await fetch(`/api/emails/attachments/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Download failed')
    }

    return response.blob()
  }

  // Delete attachment
  static async deleteAttachment(id: string): Promise<void> {
    return apiClient.delete<void>(`/emails/attachments/${id}`)
  }

  // Forwarding Rules Management
  static async getForwardingRules(accountId: string): Promise<ForwardingRule[]> {
    return apiClient.get<ForwardingRule[]>(`/emails/accounts/${accountId}/forwarding`)
  }

  // Create forwarding rule
  static async createForwardingRule(accountId: string, rule: {
    fromAddress: string
    toAddress: string
  }): Promise<ForwardingRule> {
    return apiClient.post<ForwardingRule>(`/emails/accounts/${accountId}/forwarding`, rule)
  }

  // Update forwarding rule
  static async updateForwardingRule(accountId: string, ruleId: string, updates: Partial<ForwardingRule>): Promise<ForwardingRule> {
    return apiClient.patch<ForwardingRule>(`/emails/accounts/${accountId}/forwarding/${ruleId}`, updates)
  }

  // Delete forwarding rule
  static async deleteForwardingRule(accountId: string, ruleId: string): Promise<void> {
    return apiClient.delete<void>(`/emails/accounts/${accountId}/forwarding/${ruleId}`)
  }

  // Email Statistics
  static async getEmailStats(accountId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<{
    sent: number
    received: number
    storage: number
    period: string
  }> {
    return apiClient.get(`/emails/accounts/${accountId}/stats`, { period })
  }

  // Spam Management
  static async markAsSpam(emailId: string): Promise<void> {
    return apiClient.post<void>(`/emails/messages/${emailId}/spam`)
  }

  // Mark as not spam
  static async markAsNotSpam(emailId: string): Promise<void> {
    return apiClient.post<void>(`/emails/messages/${emailId}/not-spam`)
  }

  // Get spam settings
  static async getSpamSettings(): Promise<{
    enabled: boolean
    sensitivity: 'low' | 'medium' | 'high'
    whitelist: string[]
    blacklist: string[]
  }> {
    return apiClient.get('/emails/spam/settings')
  }

  // Update spam settings
  static async updateSpamSettings(settings: {
    enabled?: boolean
    sensitivity?: 'low' | 'medium' | 'high'
    whitelist?: string[]
    blacklist?: string[]
  }): Promise<void> {
    return apiClient.patch<void>('/emails/spam/settings', settings)
  }
}