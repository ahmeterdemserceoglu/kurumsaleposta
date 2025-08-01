'use client'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  target: 'all' | 'admins' | 'users' | 'company'
  targetId?: string
  isRead: boolean
  createdBy: string
  createdAt: string
  expiresAt?: string
}

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  onMarkAsRead: (notificationId: string) => void
  onDelete: (notificationId: string) => void
}

export function NotificationList({
  notifications,
  loading,
  onMarkAsRead,
  onDelete
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Bildirimler yükleniyor...</p>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return '💡'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'success':
        return '✅'
      default:
        return '📢'
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      'info': 'bg-blue-100 text-blue-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800',
      'success': 'bg-green-100 text-green-800'
    }

    const labels = {
      'info': 'Bilgi',
      'warning': 'Uyarı',
      'error': 'Hata',
      'success': 'Başarı'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || colors.info}`}>
        {labels[type as keyof typeof labels] || type}
      </span>
    )
  }

  const getTargetBadge = (target: string, targetId?: string) => {
    const colors = {
      'all': 'bg-purple-100 text-purple-800',
      'admins': 'bg-indigo-100 text-indigo-800',
      'users': 'bg-green-100 text-green-800',
      'company': 'bg-orange-100 text-orange-800'
    }

    const labels = {
      'all': 'Herkese',
      'admins': 'Adminlere',
      'users': 'Kullanıcılara',
      'company': 'Şirkete'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[target as keyof typeof colors] || colors.all}`}>
        {labels[target as keyof typeof labels] || target}
        {targetId && ` (${targetId})`}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Bildirim bulunamadı
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeBadge(notification.type)}
                      {getTargetBadge(notification.target, notification.targetId)}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Oluşturan: {notification.createdBy}</span>
                      <span>•</span>
                      <span>{new Date(notification.createdAt).toLocaleString('tr-TR')}</span>
                      {notification.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Bitiş: {new Date(notification.expiresAt).toLocaleString('tr-TR')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Okundu İşaretle
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(notification.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}