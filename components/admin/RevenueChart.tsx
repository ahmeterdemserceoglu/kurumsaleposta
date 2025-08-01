'use client'

import { useState, useEffect } from 'react'

interface RevenueData {
  date: string
  revenue: number
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchRevenueData()
  }, [period])

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`/api/admin/dashboard/revenue?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Gelir Trendi</h3>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
        <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Gelir Trendi</h3>
          <p className="text-sm text-gray-500">
            Toplam: ₺{totalRevenue.toLocaleString('tr-TR')}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 90 Gün</option>
        </select>
      </div>

      <div className="h-64 flex items-end space-x-1">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
              style={{
                height: `${(item.revenue / maxRevenue) * 200}px`,
                minHeight: '4px'
              }}
              title={`${new Date(item.date).toLocaleDateString('tr-TR')}: ₺${item.revenue.toLocaleString('tr-TR')}`}
            ></div>
            <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
              {new Date(item.date).toLocaleDateString('tr-TR', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Veri bulunamadı
        </div>
      )}
    </div>
  )
}