'use client'

import { useState, useEffect } from 'react'
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { UserGrowthChart } from '@/components/admin/UserGrowthChart'

interface DashboardStats {
  totalUsers: number
  totalCompanies: number
  activeSubscriptions: number
  openTickets: number
  todayRevenue: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Son güncelleme: {new Date().toLocaleString('tr-TR')}
        </div>
      </div>


        {/* Sistem Durumu */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sistem Durumu</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sunucu</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Çevrimiçi
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Veritabanı</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Çevrimiçi
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">E-posta Sunucusu</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Çevrimiçi
              </span>
            </div>
          </div>
        </div>
      </div>

  )
}