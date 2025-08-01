'use client'

import { useState, useEffect } from 'react'
import { ReportCard } from '@/components/admin/ReportCard'
import { ReportChart } from '@/components/admin/ReportChart'

interface ReportData {
  totalRevenue: number
  totalUsers: number
  totalCompanies: number
  activeSubscriptions: number
  monthlyGrowth: number
  churnRate: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/admin/reports/export?format=${format}&period=${selectedPeriod}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${selectedPeriod}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 90 Gün</option>
            <option value="1y">Son 1 Yıl</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            PDF İndir
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Excel İndir
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReportCard
            title="Toplam Gelir"
            value={`₺${reportData.totalRevenue.toLocaleString('tr-TR')}`}
            change={`+${reportData.monthlyGrowth}%`}
            changeType="positive"
            icon="💰"
          />
          <ReportCard
            title="Toplam Kullanıcı"
            value={reportData.totalUsers.toLocaleString('tr-TR')}
            change="+12%"
            changeType="positive"
            icon="👥"
          />
          <ReportCard
            title="Aktif Şirket"
            value={reportData.totalCompanies.toLocaleString('tr-TR')}
            change="+8%"
            changeType="positive"
            icon="🏢"
          />
          <ReportCard
            title="Aktif Abonelik"
            value={reportData.activeSubscriptions.toLocaleString('tr-TR')}
            change="+15%"
            changeType="positive"
            icon="📊"
          />
          <ReportCard
            title="Churn Rate"
            value={`${reportData.churnRate}%`}
            change="-2%"
            changeType="negative"
            icon="📉"
          />
          <ReportCard
            title="Ortalama Gelir"
            value={`₺${Math.round(reportData.totalRevenue / reportData.totalCompanies).toLocaleString('tr-TR')}`}
            change="+5%"
            changeType="positive"
            icon="💳"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Gelir Trendi"
          type="revenue"
          period={selectedPeriod}
        />
        <ReportChart
          title="Kullanıcı Büyümesi"
          type="users"
          period={selectedPeriod}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Plan Dağılımı"
          type="plans"
          period={selectedPeriod}
        />
        <ReportChart
          title="Ödeme Yöntemleri"
          type="payments"
          period={selectedPeriod}
        />
      </div>

      {/* Detailed Tables */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detaylı Analiz</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">En Çok Gelir Getiren Şirketler</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Şirket {i}</span>
                    <span className="text-sm font-medium">₺{(Math.random() * 10000).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">En Aktif Kullanıcılar</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">user{i}@example.com</span>
                    <span className="text-sm font-medium">{Math.floor(Math.random() * 100)} e-posta</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}