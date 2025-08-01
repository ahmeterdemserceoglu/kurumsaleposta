'use client'

interface UserFilters {
  search: string
  role: string
  status: string
  plan: string
}

interface UserFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  onReset: () => void
}

export function UserFilters({ filters, onFiltersChange, onReset }: UserFiltersProps) {
  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arama
          </label>
          <input
            type="text"
            placeholder="E-posta veya isim ara..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Roller</option>
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Süper Admin</option>
          </select>
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
            <option value="banned">Yasaklı</option>
          </select>
        </div>

        {/* Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan
          </label>
          <select
            value={filters.plan}
            onChange={(e) => handleFilterChange('plan', e.target.value)}
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
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Dışa Aktar
        </button>
      </div>
    </div>
  )
}