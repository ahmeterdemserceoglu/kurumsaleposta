'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthService } from '@/lib/auth'
import { PasswordResetFormData } from '@/lib/validations'
import { PasswordResetForm } from '@/components/forms/PasswordResetForm'
import { APIClientError } from '@/lib/api'

export default function PasswordResetPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePasswordReset = async (data: PasswordResetFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await AuthService.requestPasswordReset(data.email)
      setSuccess(true)
    } catch (error) {
      if (error instanceof APIClientError) {
        setError(error.message)
      } else {
        setError('Şifre sıfırlama talebi gönderilirken bir hata oluştu')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
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
              <a href="/login" className="text-muted-foreground hover:text-foreground">Giriş Yap</a>
            </div>
          </div>
        </header>

        <main className="py-20 px-4 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  E-posta gönderildi!
                </h2>
                <p className="text-muted-foreground mb-8">
                  Eğer e-posta adresiniz sistemde kayıtlıysa, yedek e-posta adresinize şifre sıfırlama bağlantısı gönderilmiştir.
                </p>
                <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-muted-foreground text-left">
                      Şifre sıfırlama bağlantısı, hesabınıza kayıtlı <strong>yedek e-posta adresine</strong> gönderildi. Lütfen gelen kutunuzu kontrol edin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center py-3 px-6 border border-border rounded-lg text-sm font-medium text-muted-foreground bg-card hover:bg-muted transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
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
            <a href="/login" className="text-muted-foreground hover:text-foreground">Giriş Yap</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0119 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Şifrenizi mi unuttunuz?</h1>
            <p className="text-muted-foreground">
              Endişelenmeyin, yedek e-postanıza link göndereceğiz
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

            <PasswordResetForm onSubmit={handlePasswordReset} isLoading={isLoading} />

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">
                    Hesabınızı hatırladınız mı?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center py-3 px-4 border border-border rounded-lg text-sm font-medium text-muted-foreground bg-card hover:bg-muted transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Giriş yap
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Şifre sıfırlama bağlantısı, güvenlik nedeniyle kayıt sırasında belirttiğiniz <strong>yedek e-posta adresine</strong> gönderilecektir.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}