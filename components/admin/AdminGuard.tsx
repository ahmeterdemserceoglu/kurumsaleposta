'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TokenManager } from '@/lib/auth'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // Token kontrolü
      const token = TokenManager.getAccessToken()
      if (!token) {
        console.log('AdminGuard - No token found')
        router.push('/login?redirect=/admin')
        return
      }

      // Token süresi kontrolü
      if (TokenManager.isTokenExpired(token)) {
        console.log('AdminGuard - Token expired')
        TokenManager.clearTokens()
        router.push('/login?redirect=/admin')
        return
      }

      // User bilgisi kontrolü
      const user = TokenManager.getUser()
      if (!user) {
        console.log('AdminGuard - No user data')
        router.push('/login?redirect=/admin')
        return
      }

      console.log('AdminGuard - User role:', user.role)

      // Role kontrolü
      if (!['admin', 'super_admin'].includes(user.role)) {
        console.log('AdminGuard - Insufficient role:', user.role)
        router.push('/?error=unauthorized')
        return
      }

      // Token ve role kontrolü yeterli (middleware zaten kontrol ediyor)
      console.log('AdminGuard - Access granted')
      setIsAuthorized(true)

    } catch (error) {
      console.error('AdminGuard - Error:', error)
      router.push('/login?redirect=/admin')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}