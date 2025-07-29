import { apiClient } from '../api'
import { 
  Company, 
  CompanySettings, 
  SecuritySettings, 
  UsageMetrics,
  User,
  Pagination 
} from '@/types'

export class CompanyAPIService {
  // Get company details
  static async getCompany(id: string): Promise<Company> {
    return apiClient.get<Company>(`/companies/${id}`)
  }

  // Update company information
  static async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    return apiClient.patch<Company>(`/companies/${id}`, updates)
  }

  // Get company settings
  static async getCompanySettings(id: string): Promise<CompanySettings> {
    return apiClient.get<CompanySettings>(`/companies/${id}/settings`)
  }

  // Update company settings
  static async updateCompanySettings(id: string, settings: Partial<CompanySettings>): Promise<CompanySettings> {
    return apiClient.patch<CompanySettings>(`/companies/${id}/settings`, settings)
  }

  // Get security settings
  static async getSecuritySettings(id: string): Promise<SecuritySettings> {
    return apiClient.get<SecuritySettings>(`/companies/${id}/security`)
  }

  // Update security settings
  static async updateSecuritySettings(id: string, settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    return apiClient.patch<SecuritySettings>(`/companies/${id}/security`, settings)
  }

  // Get usage statistics
  static async getUsageStats(id: string): Promise<UsageMetrics> {
    return apiClient.get<UsageMetrics>(`/companies/${id}/usage`)
  }

  // Get company users
  static async getCompanyUsers(id: string, pagination?: Pagination): Promise<{
    users: User[]
    total: number
    page: number
    limit: number
  }> {
    const params = pagination ? {
      page: pagination.page.toString(),
      limit: pagination.limit.toString()
    } : undefined

    return apiClient.get(`/companies/${id}/users`, params)
  }

  // Add user to company
  static async addUser(companyId: string, userData: {
    email: string
    firstName: string
    lastName: string
    role: 'admin' | 'employee'
  }): Promise<User> {
    return apiClient.post<User>(`/companies/${companyId}/users`, userData)
  }

  // Update user in company
  static async updateUser(companyId: string, userId: string, updates: Partial<User>): Promise<User> {
    return apiClient.patch<User>(`/companies/${companyId}/users/${userId}`, updates)
  }

  // Remove user from company
  static async removeUser(companyId: string, userId: string): Promise<void> {
    return apiClient.delete<void>(`/companies/${companyId}/users/${userId}`)
  }

  // Suspend company
  static async suspendCompany(id: string, reason: string): Promise<Company> {
    return apiClient.post<Company>(`/companies/${id}/suspend`, { reason })
  }

  // Reactivate company
  static async reactivateCompany(id: string): Promise<Company> {
    return apiClient.post<Company>(`/companies/${id}/reactivate`)
  }

  // Delete company (admin only)
  static async deleteCompany(id: string): Promise<void> {
    return apiClient.delete<void>(`/companies/${id}`)
  }

  // Get company activity log
  static async getActivityLog(id: string, pagination?: Pagination): Promise<{
    activities: Array<{
      id: string
      action: string
      userId: string
      userName: string
      timestamp: Date
      details?: Record<string, unknown>
    }>
    total: number
    page: number
    limit: number
  }> {
    const params = pagination ? {
      page: pagination.page.toString(),
      limit: pagination.limit.toString()
    } : undefined

    return apiClient.get(`/companies/${id}/activity`, params)
  }

  // Export company data
  static async exportCompanyData(id: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await fetch(`/api/companies/${id}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    return response.blob()
  }
}