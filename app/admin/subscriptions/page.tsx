'use client'

import { useState, useEffect } from 'react'
import { SubscriptionTable } from '@/components/admin/SubscriptionTable'
import { SubscriptionFilters } from '@/components/admin/SubscriptionFilters'

interface Subscription {
  id: string
  companyId: string
  companyName: string
  plan: 'starter' | 'business' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'suspended'
  price: number
  currency: string
  billing_cycle: 'monthly' | 'yearly'
  starts_at: string
  ends_at: string
  auto_renew: boolean
  createdAt: string
}

interface SubscriptionFilters {
  search: string
  plan: string
  status: string
  billing_cycle: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SubscriptionFilters>({
    search: '',
    plan: '',
    status: '',
    billing_cycle: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchSubscriptions()
  }, [filters, currentPage])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...filters
      })

      const response = await fetch(`/api/admin/subscriptions?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchSubscriptions() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating subscription status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Abonelik Yönetimi</h1>
        <div className="text-sm text-gray-500">
          Toplam {subscriptions.length} abonelik
        </div>
      </div>

      {/* Filtreler */}
      <SubscriptionFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onReset={() => setFilters({ search: '', plan: '', status: '', billing_cycle: '' })}
      />

      {/* Abonelik Tablosu */}
      <SubscriptionTable
        subscriptions={subscriptions}
        loading={loading}
        onStatusChange={handleStatusChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}