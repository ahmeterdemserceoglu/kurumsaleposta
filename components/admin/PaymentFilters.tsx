'use client'

interface PaymentFilters {
  search: string
  status: string
  payment_method: string
  gateway: string
  date_from: string
  date_to: string
}

interface PaymentFiltersProps {
  filters: PaymentFilters
  onFiltersChange: (filters: PaymentFilters) => void
  onReset: () => void
}

export function PaymentFilters({ filters, onFiltersChange, onReset }: PaymentFiltersProps) {
  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arama
          </label>
          <input
            type="text"
            placeholder="Şirket adı ara..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="completed">Tamamlandı</option>
            <option value="failed">Başarısız</option>
            <option value="refunded">İade Edildi</option>
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ödeme Yöntemi
          </label>
          <select
            value={filters.payment_method}
            onChange={(e) => handleFilterChange('payment_method', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Yöntemler</option>
            <option value="credit_card">Kredi Kartı</option>
            <option value="bank_transfer">Banka Havalesi</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        {/* Gateway */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gateway
          </label>
          <select
            value={filters.gateway}
            onChange={(e) => handleFilterChange('gateway', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Gateway'ler</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="iyzico">Iyzico</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Temizle
        </button>
        <button
          onClick={() => {/* Export functionality */}}
          className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
        >
          Excel İndir
        </button>
        <button
          onClick={() => {/* Export functionality */}}
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          PDF İndir
        </button>
      </div>
    </div>
  )
}