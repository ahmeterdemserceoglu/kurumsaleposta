'use client'

interface ReportCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: string
}

export function ReportCard({ title, value, change, changeType, icon }: ReportCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-gray-100">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <div className="flex items-center mt-1">
            <span className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">önceki döneme göre</span>
          </div>
        </div>
      </div>
    </div>
  )
}