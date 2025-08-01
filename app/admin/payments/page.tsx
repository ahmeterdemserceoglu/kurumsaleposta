'use client'

import { useState, useEffect } from 'react'
import { PaymentTable } from '@/components/admin/PaymentTable'
import { PaymentFilters } from '@/components/admin/PaymentFilters'
import { PaymentStats } from '@/components/admin/PaymentStats'

interface Payment {
  id: string
  companyId: string
  companyName: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: 'credit_card' | 'bank_transfer' | 'paypal'
  transaction_id: string
  gateway: string
  description: string
  paid_at: string
  createdAt: string
}

interface PaymentFilters {
  search: string
  status: string
  payment_method: string
  gateway: string
  date_from: string
  date_to: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PaymentFilters>({
    search: '',
    status: '',
    payment_method: '',
    gateway: '',
    date_from: '',
    date_to: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPayments()
  }, [filters, currentPage])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...filters
      })

      const response = await fetch(`/api/admin/payments?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (paymentId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        fetchPayments() // Refresh the list
      }
    } catch (error) {
      console.error('Error processing refund:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ödeme Yönetimi</h1>
        <div className="text-sm text-gray-500">
          Toplam {payments.length} ödeme
        </div>
      </div>

      {/* Payment Stats */}
      <PaymentStats />

      {/* Filtreler */}
      <PaymentFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onReset={() => setFilters({ search: '', status: '', payment_method: '', gateway: '', date_from: '', date_to: '' })}
      />

      {/* Payment Tablosu */}
      <PaymentTable
        payments={payments}
        loading={loading}
        onRefund={handleRefund}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}