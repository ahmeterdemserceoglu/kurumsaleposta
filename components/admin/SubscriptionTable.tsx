'use client'

interface Subscription {
  id: string
  companyId: string
  companyName: string
  plan: 'starter' | 'business' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'suspended'
  price: number
  currency: string
  billing_cycle: 'monthly' | 'yearly'
  starts_at: string
  ends_at: string
  auto_renew: boolean
  createdAt: string
}

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  loading: boolean
  onStatusChange: (subscriptionId: string, newStatus: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SubscriptionTable({
  subscriptions,
  loading,
  onStatusChange,
  currentPage,
  totalPages,
  onPageChange
}: SubscriptionTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Abonelikler yükleniyor...</p>
        </div>
      </div>
    )
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      'starter': 'bg-blue-100 text-blue-800',
      'business': 'bg-green-100 text-green-800',
      'enterprise': 'bg-purple-100 text-purple-800'
    }

    const labels = {
      'starter': 'Başlangıç',
      'business': 'İş',
      'enterprise': 'Kurumsal'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[plan as keyof typeof colors] || colors.starter}`}>
        {labels[plan as keyof typeof labels] || plan}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800',
      'suspended': 'bg-yellow-100 text-yellow-800'
    }

    const labels = {
      'active': 'Aktif',
      'cancelled': 'İptal Edildi',
      'expired': 'Süresi Doldu',
      'suspended': 'Askıda'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.expired}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Şirket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fiyat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dönem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bitiş Tarihi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {subscription.companyName}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {subscription.companyId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPlanBadge(subscription.plan)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(subscription.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subscription.price.toLocaleString('tr-TR')} {subscription.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subscription.billing_cycle === 'monthly' ? 'Aylık' : 'Yıllık'}
                  {subscription.auto_renew && (
                    <span className="ml-2 text-xs text-green-600">(Otomatik)</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(subscription.ends_at).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={subscription.status}
                    onChange={(e) => onStatusChange(subscription.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="active">Aktif</option>
                    <option value="suspended">Askıya Al</option>
                    <option value="cancelled">İptal Et</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}