'use client'

interface DashboardStats {
  totalUsers: number
  totalCompanies: number
  activeSubscriptions: number
  openTickets: number
  todayRevenue: number
  monthlyRevenue: number
}

interface AdminStatsCardsProps {
  stats: DashboardStats | null
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse flex items-center">
              <div className="p-3 rounded-lg bg-gray-200 w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  const cards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers.toLocaleString('tr-TR'),
      icon: '👥',
      color: 'bg-blue-100 text-blue-600',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Toplam Şirket',
      value: stats.totalCompanies.toLocaleString('tr-TR'),
      icon: '🏢',
      color: 'bg-green-100 text-green-600',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Aktif Abonelik',
      value: stats.activeSubscriptions.toLocaleString('tr-TR'),
      icon: '📊',
      color: 'bg-purple-100 text-purple-600',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Açık Talepler',
      value: stats.openTickets.toLocaleString('tr-TR'),
      icon: '🎫',
      color: 'bg-yellow-100 text-yellow-600',
      change: '-5%',
      changeType: 'negative' as const
    },
    {
      title: 'Günlük Gelir',
      value: `₺${stats.todayRevenue.toLocaleString('tr-TR')}`,
      icon: '💰',
      color: 'bg-emerald-100 text-emerald-600',
      change: '+22%',
      changeType: 'positive' as const
    },
    {
      title: 'Aylık Gelir',
      value: `₺${stats.monthlyRevenue.toLocaleString('tr-TR')}`,
      icon: '📈',
      color: 'bg-indigo-100 text-indigo-600',
      change: '+18%',
      changeType: 'positive' as const
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${card.color}`}>
              <span className="text-2xl">{card.icon}</span>
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