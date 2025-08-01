'use client'

import { useState, useEffect } from 'react'

interface PaymentStatsData {
  totalRevenue: number
  totalPayments: number
  successRate: number
  averageAmount: number
  todayRevenue: number
  monthlyRevenue: number
  pendingAmount: number
  refundedAmount: number
}

export function PaymentStats() {
  const [stats, setStats] = useState<PaymentStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentStats()
  }, [])

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">İstatistikler yüklenemedi</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Toplam Gelir',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`,
      icon: '💰',
      color: 'bg-green-100 text-green-600',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Toplam Ödeme',
      value: stats.totalPayments.toLocaleString('tr-TR'),
      icon: '💳',
      color: 'bg-blue-100 text-blue-600',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Başarı Oranı',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: '✅',
      color: 'bg-emerald-100 text-emerald-600',
      change: '+2%',
      changeType: 'positive' as const
    },
    {
      title: 'Ortalama Tutar',
      value: `₺${stats.averageAmount.toLocaleString('tr-TR')}`,
      icon: '📊',
      color: 'bg-purple-100 text-purple-600',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Günlük Gelir',
      value: `₺${stats.todayRevenue.toLocaleString('tr-TR')}`,
      icon: '📈',
      color: 'bg-indigo-100 text-indigo-600',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Aylık Gelir',
      value: `₺${stats.monthlyRevenue.toLocaleString('tr-TR')}`,
      icon: '📅',
      color: 'bg-cyan-100 text-cyan-600',
      change: '+18%',
      changeType: 'positive' as const
    },
    {
      title: 'Bekleyen Ödemeler',
      value: `₺${stats.pendingAmount.toLocaleString('tr-TR')}`,
      icon: '⏳',
      color: 'bg-yellow-100 text-yellow-600',
      change: '-3%',
      changeType: 'negative' as const
    },
    {
      title: 'İade Edilen',
      value: `₺${stats.refundedAmount.toLocaleString('tr-TR')}`,
      icon: '↩️',
      color: 'bg-red-100 text-red-600',
      change: '+1%',
      changeType: 'negative' as const
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${card.color}`}>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">bu ay</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}