'use client'

import { useState, useEffect } from 'react'

interface ChartData {
  labels: string[]
  data: number[]
}

interface ReportChartProps {
  title: string
  type: 'revenue' | 'users' | 'plans' | 'payments'
  period: '7d' | '30d' | '90d' | '1y'
}

export function ReportChart({ title, type, period }: ReportChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [type, period])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports/chart?type=${type}&period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setChartData(data.chartData)
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Veri yüklenemedi
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...chartData.data)

  // For pie charts (plans, payments)
  if (type === 'plans' || type === 'payments') {
    const total = chartData.data.reduce((sum, value) => sum + value, 0)
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {chartData.data.map((value, index) => {
                const percentage = (value / total) * 100
                const strokeDasharray = `${percentage} ${100 - percentage}`
                const strokeDashoffset = chartData.data
                  .slice(0, index)
                  .reduce((sum, v) => sum + (v / total) * 100, 0)

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={colors[index % colors.length]}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>
          </div>
          <div className="ml-6 space-y-2">
            {chartData.labels.map((label, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-sm text-gray-600">
                  {label}: {chartData.data[index]} ({((chartData.data[index] / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // For line/bar charts (revenue, users)
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64 flex items-end space-x-1">
        {chartData.data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
              style={{
                height: `${(value / maxValue) * 200}px`,
                minHeight: '4px'
              }}
              title={`${chartData.labels[index]}: ${value.toLocaleString('tr-TR')}`}
            ></div>
            <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
              {chartData.labels[index]}
            </div>
          </div>
        ))}
      </div>

      {chartData.data.length === 0 && (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Veri bulunamadı
        </div>
      )}
    </div>
  )
}