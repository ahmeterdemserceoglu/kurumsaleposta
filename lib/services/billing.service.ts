import { apiClient } from '../api'
import { Subscription, PricingPlan, UsageMetrics } from '@/types'

export class BillingAPIService {
    // Get current subscription
    static async getSubscription(companyId: string): Promise<Subscription> {
        return apiClient.get<Subscription>(`/billing/subscription`, { companyId })
    }

    // Get available pricing plans
    static async getPricingPlans(): Promise<PricingPlan[]> {
        return apiClient.get<PricingPlan[]>('/billing/plans')
    }

    // Get specific pricing plan
    static async getPricingPlan(planId: string): Promise<PricingPlan> {
        return apiClient.get<PricingPlan>(`/billing/plans/${planId}`)
    }

    // Upgrade/downgrade subscription
    static async changePlan(companyId: string, newPlan: string): Promise<Subscription> {
        return apiClient.post<Subscription>('/billing/change-plan', {
            companyId,
            newPlan
        })
    }

    // Cancel subscription
    static async cancelSubscription(companyId: string, reason?: string): Promise<Subscription> {
        return apiClient.post<Subscription>('/billing/cancel', {
            companyId,
            reason
        })
    }

    // Reactivate subscription
    static async reactivateSubscription(companyId: string): Promise<Subscription> {
        return apiClient.post<Subscription>('/billing/reactivate', { companyId })
    }

    // Get billing history
    static async getBillingHistory(companyId: string, pagination?: {
        page: number
        limit: number
    }): Promise<{
        invoices: Array<{
            id: string
            number: string
            date: Date
            dueDate: Date
            amount: number
            status: 'paid' | 'pending' | 'overdue' | 'cancelled'
            items: Array<{
                description: string
                quantity: number
                unitPrice: number
                total: number
            }>
            downloadUrl: string
        }>
        total: number
        page: number
        limit: number
    }> {
        const params: Record<string, string> = pagination ? {
            companyId,
            page: pagination.page.toString(),
            limit: pagination.limit.toString()
        } : { companyId }

        return apiClient.get('/billing/history', params)
    }

    // Get current invoice
    static async getCurrentInvoice(companyId: string): Promise<{
        id: string
        number: string
        date: Date
        dueDate: Date
        amount: number
        status: 'draft' | 'sent' | 'paid' | 'overdue'
        items: Array<{
            description: string
            quantity: number
            unitPrice: number
            total: number
        }>
        downloadUrl: string
    }> {
        return apiClient.get('/billing/current-invoice', { companyId })
    }

    // Download invoice
    static async downloadInvoice(invoiceId: string): Promise<Blob> {
        const response = await fetch(`/api/billing/invoices/${invoiceId}/download`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        })

        if (!response.ok) {
            throw new Error('Download failed')
        }

        return response.blob()
    }

    // Get payment methods
    static async getPaymentMethods(companyId: string): Promise<Array<{
        id: string
        type: 'card' | 'bank_account'
        last4: string
        brand?: string
        expiryMonth?: number
        expiryYear?: number
        isDefault: boolean
        createdAt: Date
    }>> {
        return apiClient.get('/billing/payment-methods', { companyId })
    }

    // Add payment method
    static async addPaymentMethod(companyId: string, paymentData: {
        type: 'card' | 'bank_account'
        cardNumber?: string
        expiryMonth?: number
        expiryYear?: number
        cvv?: string
        cardholderName?: string
        accountNumber?: string
        routingNumber?: string
        accountHolderName?: string
    }): Promise<{
        id: string
        type: string
        last4: string
        brand?: string
    }> {
        return apiClient.post('/billing/payment-methods', {
            companyId,
            ...paymentData
        })
    }

    // Update payment method
    static async updatePaymentMethod(paymentMethodId: string, updates: {
        expiryMonth?: number
        expiryYear?: number
        isDefault?: boolean
    }): Promise<void> {
        return apiClient.patch<void>(`/billing/payment-methods/${paymentMethodId}`, updates)
    }

    // Delete payment method
    static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
        return apiClient.delete<void>(`/billing/payment-methods/${paymentMethodId}`)
    }

    // Set default payment method
    static async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
        return apiClient.post<void>(`/billing/payment-methods/${paymentMethodId}/set-default`)
    }

    // Process payment
    static async processPayment(companyId: string, amount: number, paymentMethodId?: string): Promise<{
        id: string
        status: 'succeeded' | 'failed' | 'pending'
        amount: number
        currency: string
        receiptUrl?: string
    }> {
        return apiClient.post('/billing/process-payment', {
            companyId,
            amount,
            paymentMethodId
        })
    }

    // Get usage and billing preview
    static async getBillingPreview(companyId: string): Promise<{
        currentPeriod: {
            start: Date
            end: Date
        }
        usage: UsageMetrics
        charges: Array<{
            description: string
            quantity: number
            unitPrice: number
            total: number
        }>
        subtotal: number
        tax: number
        total: number
        nextBillingDate: Date
    }> {
        return apiClient.get('/billing/preview', { companyId })
    }

    // Get usage limits and warnings
    static async getUsageLimits(companyId: string): Promise<{
        plan: string
        limits: {
            emailAccounts: { used: number; limit: number }
            storage: { used: number; limit: number }
            emailsSent: { used: number; limit: number }
            domains: { used: number; limit: number }
        }
        warnings: Array<{
            type: 'approaching_limit' | 'limit_exceeded'
            resource: string
            message: string
            threshold: number
            current: number
        }>
    }> {
        return apiClient.get('/billing/usage-limits', { companyId })
    }

    // Request billing support
    static async requestBillingSupport(companyId: string, issue: {
        type: 'billing_question' | 'payment_issue' | 'refund_request' | 'other'
        subject: string
        description: string
        priority: 'low' | 'medium' | 'high'
    }): Promise<{
        ticketId: string
        status: 'open'
        createdAt: Date
    }> {
        return apiClient.post('/billing/support', {
            companyId,
            ...issue
        })
    }

    // Apply coupon or discount code
    static async applyCoupon(companyId: string, couponCode: string): Promise<{
        coupon: {
            code: string
            description: string
            discountType: 'percentage' | 'fixed'
            discountValue: number
            validUntil?: Date
        }
        applied: boolean
        message: string
    }> {
        return apiClient.post('/billing/apply-coupon', {
            companyId,
            couponCode
        })
    }

    // Remove applied coupon
    static async removeCoupon(companyId: string): Promise<void> {
        return apiClient.delete<void>(`/billing/remove-coupon?companyId=${companyId}`)
    }

    // Get tax information
    static async getTaxInfo(companyId: string): Promise<{
        taxId?: string
        taxRate: number
        taxRegion: string
        exemptionStatus: 'none' | 'partial' | 'full'
        exemptionCertificate?: string
    }> {
        return apiClient.get('/billing/tax-info', { companyId })
    }

    // Update tax information
    static async updateTaxInfo(companyId: string, taxInfo: {
        taxId?: string
        taxRegion?: string
        exemptionCertificate?: File
    }): Promise<void> {
        if (taxInfo.exemptionCertificate) {
            // Use uploadFile method for form data with file
            return apiClient.uploadFile<void>('/billing/tax-info', taxInfo.exemptionCertificate, {
                companyId,
                taxId: taxInfo.taxId || '',
                taxRegion: taxInfo.taxRegion || ''
            })
        } else {
            // Use regular patch for data without file
            return apiClient.patch<void>('/billing/tax-info', {
                companyId,
                taxId: taxInfo.taxId,
                taxRegion: taxInfo.taxRegion
            })
        }
    }
}