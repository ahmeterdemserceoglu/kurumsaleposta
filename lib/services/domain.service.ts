import { apiClient } from '../api'
import { Domain, DNSRecord } from '@/types'

export class DomainAPIService {
  // Get all domains for a company
  static async getDomains(companyId: string): Promise<Domain[]> {
    return apiClient.get<Domain[]>(`/domains`, { companyId })
  }

  // Get single domain
  static async getDomain(id: string): Promise<Domain> {
    return apiClient.get<Domain>(`/domains/${id}`)
  }

  // Add new domain
  static async addDomain(companyId: string, domainName: string): Promise<Domain> {
    return apiClient.post<Domain>('/domains', {
      name: domainName,
      companyId
    })
  }

  // Update domain
  static async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain> {
    return apiClient.patch<Domain>(`/domains/${id}`, updates)
  }

  // Delete domain
  static async deleteDomain(id: string): Promise<void> {
    return apiClient.delete<void>(`/domains/${id}`)
  }

  // Verify domain ownership
  static async verifyDomain(id: string): Promise<{
    verified: boolean
    status: 'verified' | 'pending' | 'failed'
    message?: string
    nextCheck?: Date
  }> {
    return apiClient.post(`/domains/${id}/verify`)
  }

  // Get DNS configuration instructions
  static async getDNSInstructions(id: string): Promise<{
    domain: string
    records: DNSRecord[]
    instructions: string[]
    verificationToken: string
  }> {
    return apiClient.get(`/domains/${id}/dns-instructions`)
  }

  // Check DNS configuration
  static async checkDNSConfiguration(id: string): Promise<{
    domain: string
    records: Array<{
      type: string
      name: string
      expectedValue: string
      actualValue?: string
      status: 'correct' | 'incorrect' | 'missing'
    }>
    overallStatus: 'correct' | 'incorrect' | 'partial'
    issues: string[]
  }> {
    return apiClient.get(`/domains/${id}/dns-check`)
  }

  // Get domain health status
  static async getDomainHealth(id: string): Promise<{
    domain: string
    status: 'healthy' | 'warning' | 'error'
    checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warning'
      message: string
      lastChecked: Date
    }>
    lastUpdated: Date
  }> {
    return apiClient.get(`/domains/${id}/health`)
  }

  // Run domain diagnostics
  static async runDiagnostics(id: string): Promise<{
    domain: string
    tests: Array<{
      name: string
      status: 'pass' | 'fail' | 'warning'
      message: string
      details?: Record<string, unknown>
    }>
    summary: {
      passed: number
      failed: number
      warnings: number
    }
    recommendations: string[]
  }> {
    return apiClient.post(`/domains/${id}/diagnostics`)
  }

  // Check domain availability (for new registrations)
  static async checkDomainAvailability(domainName: string): Promise<{
    domain: string
    available: boolean
    price?: number
    suggestions?: string[]
  }> {
    return apiClient.get('/domains/availability', { domain: domainName })
  }

  // Get MX record validation
  static async validateMXRecords(domainName: string): Promise<{
    domain: string
    mxRecords: Array<{
      priority: number
      exchange: string
      status: 'correct' | 'incorrect'
    }>
    status: 'valid' | 'invalid' | 'partial'
    issues: string[]
  }> {
    return apiClient.get('/domains/mx-validation', { domain: domainName })
  }

  // Get SPF record validation
  static async validateSPFRecord(domainName: string): Promise<{
    domain: string
    spfRecord?: string
    status: 'valid' | 'invalid' | 'missing'
    issues: string[]
    recommendations: string[]
  }> {
    return apiClient.get('/domains/spf-validation', { domain: domainName })
  }

  // Get DKIM record validation
  static async validateDKIMRecord(domainName: string): Promise<{
    domain: string
    dkimRecord?: string
    status: 'valid' | 'invalid' | 'missing'
    issues: string[]
    recommendations: string[]
  }> {
    return apiClient.get('/domains/dkim-validation', { domain: domainName })
  }

  // Get DMARC record validation
  static async validateDMARCRecord(domainName: string): Promise<{
    domain: string
    dmarcRecord?: string
    status: 'valid' | 'invalid' | 'missing'
    policy?: 'none' | 'quarantine' | 'reject'
    issues: string[]
    recommendations: string[]
  }> {
    return apiClient.get('/domains/dmarc-validation', { domain: domainName })
  }

  // Generate DNS records for domain
  static async generateDNSRecords(domainName: string): Promise<{
    domain: string
    records: DNSRecord[]
    instructions: Array<{
      step: number
      title: string
      description: string
      record?: DNSRecord
    }>
  }> {
    return apiClient.post('/domains/generate-dns', { domain: domainName })
  }

  // Get domain statistics
  static async getDomainStats(id: string, period: 'day' | 'week' | 'month' = 'week'): Promise<{
    domain: string
    period: string
    emailsSent: number
    emailsReceived: number
    bounceRate: number
    deliveryRate: number
    spamRate: number
  }> {
    return apiClient.get(`/domains/${id}/stats`, { period })
  }

  // Get domain reputation
  static async getDomainReputation(domainName: string): Promise<{
    domain: string
    reputation: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'
    score: number
    factors: Array<{
      name: string
      status: 'positive' | 'negative' | 'neutral'
      impact: 'high' | 'medium' | 'low'
      description: string
    }>
    recommendations: string[]
    lastUpdated: Date
  }> {
    return apiClient.get('/domains/reputation', { domain: domainName })
  }

  // Set up domain forwarding
  static async setupDomainForwarding(id: string, forwardTo: string): Promise<void> {
    return apiClient.post<void>(`/domains/${id}/forwarding`, { forwardTo })
  }

  // Remove domain forwarding
  static async removeDomainForwarding(id: string): Promise<void> {
    return apiClient.delete<void>(`/domains/${id}/forwarding`)
  }

  // Get domain forwarding settings
  static async getDomainForwarding(id: string): Promise<{
    enabled: boolean
    forwardTo?: string
    createdAt?: Date
  }> {
    return apiClient.get(`/domains/${id}/forwarding`)
  }
}