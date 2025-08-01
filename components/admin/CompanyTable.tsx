'use client'

import { useState } from 'react'

interface Company {
  id: string
  name: string
  email: string
  phone: string
  website: string
  industry: string
  size: 'small' | 'medium' | 'large' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended'
  subscription_plan: string
  subscription_status: string
  total_users: number
  total_emails_sent: number
  last_login: string
  createdAt: string
}

interface CompanyTableProps {
  companies: Company[]
  loading: boolean
  onViewCompany: (company: Company) => void
  onSuspendCompany: (companyId: string, reason: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function CompanyTable({
  companies,
  loading,
  onViewCompany,
  onSuspendCompany,
  currentPage,
  totalPages,
  onPageChange
}: CompanyTableProps) {
  const [suspendModal, setSuspendModal] = useState<{ show: boolean; companyId: string }>({
    show: false,
    companyId: ''
  })
  const [suspendReason, setSuspendReason] = useState('')

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Şirketler yükleniyor...</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'suspended': 'bg-red-100 text-red-800'
    }

    const labels = {
      'active': 'Aktif',
      'inactive': 'Pasif',
      'suspended': 'Askıda'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.inactive}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const getSizeBadge = (size: string) => {
    const colors = {
      'small': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'large': 'bg-orange-100 text-orange-800',
      'enterprise': 'bg-purple-100 text-purple-800'
    }

    const labels = {
      'small': 'Küçük',
      'medium': 'Orta',
      'large': 'Büyük',
      'enterprise': 'Kurumsal'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[size as keyof typeof colors] || colors.small}`}>
        {labels[size as keyof typeof labels] || size}
      </span>
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

  const handleSuspend = () => {
    if (suspendReason.trim()) {
      onSuspendCompany(suspendModal.companyId, suspendReason)
      setSuspendModal({ show: false, companyId: '' })
      setSuspendReason('')
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Şirket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Boyut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcılar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Giriş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {company.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.industry}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.email}</div>
                    <div className="text-sm text-gray-500">{company.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(company.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSizeBadge(company.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPlanBadge(company.subscription_plan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.total_users} kullanıcı
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.last_login ? new Date(company.last_login).toLocaleDateString('tr-TR') : 'Hiç'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewCompany(company)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Görüntüle
                    </button>
                    {company.status === 'active' && (
                      <button
                        onClick={() => setSuspendModal({ show: true, companyId: company.id })}
                        className="text-red-600 hover:text-red-900"
                      >
                        Askıya Al
                      </button>
                    )}
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

      {/* Suspend Modal */}
      {suspendModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Şirketi Askıya Al
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Askıya Alma Sebebi
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Askıya alma sebebini açıklayın..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSuspendModal({ show: false, companyId: '' })
                    setSuspendReason('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  İptal
                </button>
                <button
                  onClick={handleSuspend}
                  disabled={!suspendReason.trim()}
                  className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                >
                  Askıya Al
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}