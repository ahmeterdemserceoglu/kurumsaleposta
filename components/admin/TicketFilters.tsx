'use client'

interface TicketFilters {
  search: string
  status: string
  priority: string
  category: string
  assigned_to: string
}

interface TicketFiltersProps {
  filters: TicketFilters
  onFiltersChange: (filters: TicketFilters) => void
  onReset: () => void
}

export function TicketFilters({ filters, onFiltersChange, onReset }: TicketFiltersProps) {
  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
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
            placeholder="Konu veya şirket ara..."
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
            <option value="open">Açık</option>
            <option value="in_progress">İşlemde</option>
            <option value="resolved">Çözüldü</option>
            <option value="closed">Kapatıldı</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Öncelik
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Öncelikler</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
            <option value="urgent">Acil</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="technical">Teknik</option>
            <option value="billing">Faturalama</option>
            <option value="general">Genel</option>
            <option value="feature_request">Özellik İsteği</option>
          </select>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Atanan
          </label>
          <select
            value={filters.assigned_to}
            onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tümü</option>
            <option value="unassigned">Atanmamış</option>
            <option value="me">Bana Atanan</option>
            {/* Admin listesi buraya eklenebilir */}
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
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Dışa Aktar
        </button>
      </div>
    </div>
  )
}