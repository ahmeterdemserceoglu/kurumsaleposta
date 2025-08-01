'use client'

import { useState } from 'react'
import { 
  EyeIcon, 
  NoSymbolIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  is_banned: boolean
  ban_reason?: string
  last_login?: string
  createdAt: string
  company: {
    id: string
    name: string
    plan: string
  }
}

interface UserManagementTableProps {
  users: User[]
  loading: boolean
  onBanUser: (user: User) => void
  onUnbanUser: (userId: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function UserManagementTable({
  users,
  loading,
  onBanUser,
  onUnbanUser,
  currentPage,
  totalPages,
  onPageChange
}: UserManagementTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800',
      'admin': 'bg-purple-100 text-purple-800',
      'user': 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      'super_admin': 'Süper Admin',
      'admin': 'Admin',
      'user': 'Kullanıcı'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || colors.user}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    )
  }

  const getStatusBadge = (status: string, is_banned: boolean) => {
    if (is_banned) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <NoSymbolIcon className="w-3 h-3 mr-1" />
          Yasaklı
        </span>
      )
    }

    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'suspended': 'bg-yellow-100 text-yellow-800'
    }

    const labels = {
      'active': 'Aktif',
      'inactive': 'Pasif',
      'suspended': 'Askıda'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.inactive}`}>
        {status === 'active' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {labels[status as keyof typeof labels] || status}
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Şirket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.company.name}</div>
                  <div className="text-sm text-gray-500">
                    {getPlanBadge(user.company.plan)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status, user.is_banned)}
                  {user.is_banned && user.ban_reason && (
                    <div className="text-xs text-red-600 mt-1">
                      {user.ban_reason}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_login 
                    ? new Date(user.last_login).toLocaleDateString('tr-TR')
                    : 'Hiç giriş yapmamış'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                      title="Detayları Görüntüle"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {user.is_banned ? (
                      <button
                        onClick={() => onUnbanUser(user.id)}
                        className="text-green-600 hover:text-green-900 flex items-center"
                        title="Yasağı Kaldır"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      user.role !== 'super_admin' && (
                        <button
                          onClick={() => onBanUser(user)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Kullanıcıyı Yasakla"
                        >
                          <NoSymbolIcon className="h-4 w-4" />
                        </button>
                      )
                    )}
                  </div>
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