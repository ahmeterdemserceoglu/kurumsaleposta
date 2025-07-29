'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthService } from '@/lib/auth'
import { LoginFormData } from '@/lib/validations'
import { LoginForm } from '@/components/forms/LoginForm'
import { APIClientError } from '@/lib/api'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const authResponse = await AuthService.login(data)
      
      // AuthService.login already saves user info to localStorage via TokenManager
      // No need to manually save again
      
      router.push('/email')
    } catch (error) {
      if (error instanceof APIClientError) {
        setError(error.message)
      } else {
        setError('Giriş yapılırken bir hata oluştu')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
    
            <span className="font-semibold text-lg">İnf İletişim</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/" className="text-muted-foreground hover:text-foreground">Anasayfa</a>
            <a href="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Kayıt Ol
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
            <p className="text-muted-foreground">
              E-posta hesabınızla giriş yapın
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {error && (
              <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">
                    Şifrenizi mi unuttunuz?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/password-reset"
                  className="w-full flex justify-center py-3 px-4 border border-border rounded-lg text-sm font-medium text-muted-foreground bg-card hover:bg-muted transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0119 9z" />
                  </svg>
                  Şifre sıfırlama
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Henüz hesabınız yok mu?{' '}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Şirketinizi kaydedin
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}