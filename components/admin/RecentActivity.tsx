'use client'

import { useState, useEffect } from 'react'

interface Activity {
  id: string
  type: 'user_registered' | 'subscription_created' | 'payment_received' | 'ticket_created'
  description: string
  user: string
  timestamp: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/activity')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return '👤'
      case 'subscription_created':
        return '📊'
      case 'payment_received':
        return '💰'
      case 'ticket_created':
        return '🎫'
      default:
        return '📝'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registered':
        return 'bg-blue-100 text-blue-600'
      case 'subscription_created':
        return 'bg-green-100 text-green-600'
      case 'payment_received':
        return 'bg-emerald-100 text-emerald-600'
      case 'ticket_created':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Son Aktiviteler</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          Tümünü Gör
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Henüz aktivite bulunmuyor</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                <span className="text-sm">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">{activity.user}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}