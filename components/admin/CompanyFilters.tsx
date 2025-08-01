'use client'

interface CompanyFilters {
  search: string
  status: string
  size: string
  industry: string
  subscription_plan: string
}

interface CompanyFiltersProps {
  filters: CompanyFilters
  onFiltersChange: (filters: CompanyFilters) => void
  onReset: () => void
}

export function CompanyFilters({ filters, onFiltersChange, onReset }: CompanyFiltersProps) {
  const handleFilterChange = (key: keyof CompanyFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="suspended">Askıda</option>
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Boyut
          </label>
          <select
            value={filters.size}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Boyutlar</option>
            <option value="small">Küçük</option>
            <option value="medium">Orta</option>
            <option value="large">Büyük</option>
            <option value="enterprise">Kurumsal</option>
          </select>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sektör
          </label>
          <select
            value={filters.industry}
            onChange={(e) => handleFilterChange('industry', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Sektörler</option>
            <option value="technology">Teknoloji</option>
            <option value="finance">Finans</option>
            <option value="healthcare">Sağlık</option>
            <option value="education">Eğitim</option>
            <option value="retail">Perakende</option>
            <option value="manufacturing">İmalat</option>
            <option value="consulting">Danışmanlık</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        {/* Subscription Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Abonelik Planı
          </label>
          <select
            value={filters.subscription_plan}
            onChange={(e) => handleFilterChange('subscription_plan', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Planlar</option>
            <option value="starter">Başlangıç</option>
            <option value="business">İş</option>
            <option value="enterprise">Kurumsal</option>
          </select>
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