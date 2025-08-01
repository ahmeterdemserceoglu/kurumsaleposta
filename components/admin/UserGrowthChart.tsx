'use client'

import { useState, useEffect } from 'react'

interface UserGrowthData {
  date: string
  users: number
  companies: number
}

export function UserGrowthChart() {
  const [data, setData] = useState<UserGrowthData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchUserGrowthData()
  }, [period])

  const fetchUserGrowthData = async () => {
    try {
      const response = await fetch(`/api/admin/dashboard/user-growth?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching user growth data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Kullanıcı Büyümesi</h3>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
        <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
      </div>
    )
  }

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.users, d.companies))
  )
  const totalUsers = data.reduce((sum, d) => sum + d.users, 0)
  const totalCompanies = data.reduce((sum, d) => sum + d.companies, 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Kullanıcı Büyümesi</h3>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">
                Kullanıcılar ({totalUsers})
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">
                Şirketler ({totalCompanies})
              </span>
            </div>
          </div>
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
            <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
              <div
                className="w-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer mb-1"
                style={{
                  height: `${(item.users / maxValue) * 180}px`,
                  minHeight: '2px'
                }}
                title={`${new Date(item.date).toLocaleDateString('tr-TR')}: ${item.users} kullanıcı`}
              ></div>
              <div
                className="w-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"
                style={{
                  height: `${(item.companies / maxValue) * 180}px`,
                  minHeight: '2px'
                }}
                title={`${new Date(item.date).toLocaleDateString('tr-TR')}: ${item.companies} şirket`}
              ></div>
            </div>
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