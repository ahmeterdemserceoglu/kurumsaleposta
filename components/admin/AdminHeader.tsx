'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { TokenManager } from '@/lib/auth'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export function AdminHeader() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = TokenManager.getUser()
    if (user) {
      setAdminUser(user)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      TokenManager.clearTokens()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Admin Panel
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Bildirimler */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          {/* Profil Menüsü */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {adminUser?.firstName} {adminUser?.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {adminUser?.role === 'super_admin' ? 'Süper Admin' : 'Admin'}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {adminUser?.firstName} {adminUser?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {adminUser?.email}
                  </div>
                </div>
                
                <button
                  onClick={() => router.push('/admin/profile')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profil Ayarları
                </button>
                
                <button
                  onClick={() => router.push('/')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Ana Siteye Git
                </button>
                
                <div className="border-t border-gray-100 mt-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}