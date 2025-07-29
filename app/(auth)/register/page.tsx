'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthService } from '@/lib/auth'
import { RegistrationFormData } from '@/lib/validations'
import { APIClientError } from '@/lib/api'

// Step components
import { CompanyInfoStep } from '@/components/onboarding/CompanyInfoStep'
import { AdminInfoStep } from '@/components/onboarding/AdminInfoStep'
import { PlanSelectionStep } from '@/components/onboarding/PlanSelectionStep'
import { ConfirmationStep } from '@/components/onboarding/ConfirmationStep'

export type OnboardingData = {
  companyName: string
  backupEmail: string
  plan: 'starter' | 'business' | 'enterprise'
  adminFirstName: string
  adminLastName: string
  adminEmail: string
  password: string
}

function RegisterContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<number | null>(null)
  const [skipPlanSelection, setSkipPlanSelection] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState<OnboardingData>({
    companyName: '',
    backupEmail: '',
    plan: 'starter',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    password: ''
  })

  // Check URL parameters on component mount
  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && ['starter', 'business', 'enterprise'].includes(planParam)) {
      setFormData(prev => ({ ...prev, plan: planParam as 'starter' | 'business' | 'enterprise' }))
      setSkipPlanSelection(true)
    }
  }, [searchParams])

  const totalSteps = skipPlanSelection ? 3 : 4

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))

    if (editingStep) {
      // If editing, go back to confirmation
      setEditingStep(null)
      setCurrentStep(totalSteps)
    } else {
      // Normal flow, go to next step
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handleEdit = (step: number) => {
    setEditingStep(step)
    setCurrentStep(step)
  }

  const handleFinalSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const registrationData: RegistrationFormData = {
        companyName: formData.companyName,
        backupEmail: formData.backupEmail,
        adminEmail: formData.adminEmail,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        password: formData.password,
        plan: formData.plan
      }

      const authResponse = await AuthService.register(registrationData)

      // AuthService.register already saves user info to localStorage via TokenManager
      // No need to manually save again

      router.push('/email')
    } catch (error) {
      if (error instanceof APIClientError) {
        setError(error.message)
      } else {
        setError('Kayıt olurken bir hata oluştu')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = (step: number) => {
    if (skipPlanSelection) {
      switch (step) {
        case 1: return 'Şirket Bilgileri'
        case 2: return 'Yönetici Bilgileri'
        case 3: return 'Onaylama'
        default: return ''
      }
    } else {
      switch (step) {
        case 1: return 'Şirket Bilgileri'
        case 2: return 'Yönetici Bilgileri'
        case 3: return 'Plan Seçimi'
        case 4: return 'Onaylama'
        default: return ''
      }
    }
  }

  const renderStep = () => {
    if (skipPlanSelection) {
      // Plan seçimi atlandığında: 1-Şirket, 2-Yönetici, 3-Onaylama
      switch (currentStep) {
        case 1:
          return (
            <CompanyInfoStep
              data={formData}
              onComplete={handleStepComplete}
              isEditing={editingStep === 1}
            />
          )
        case 2:
          return (
            <AdminInfoStep
              data={formData}
              onComplete={handleStepComplete}
              isEditing={editingStep === 2}
            />
          )
        case 3:
          return (
            <ConfirmationStep
              data={formData}
              onEdit={handleEdit}
              onSubmit={handleFinalSubmit}
              isLoading={isLoading}
              error={error}
              skipPlanSelection={true}
            />
          )
        default:
          return null
      }
    } else {
      // Normal akış: 1-Şirket, 2-Yönetici, 3-Plan, 4-Onaylama
      switch (currentStep) {
        case 1:
          return (
            <CompanyInfoStep
              data={formData}
              onComplete={handleStepComplete}
              isEditing={editingStep === 1}
            />
          )
        case 2:
          return (
            <AdminInfoStep
              data={formData}
              onComplete={handleStepComplete}
              isEditing={editingStep === 2}
            />
          )
        case 3:
          return (
            <PlanSelectionStep
              data={formData}
              onComplete={handleStepComplete}
              isEditing={editingStep === 3}
            />
          )
        case 4:
          return (
            <ConfirmationStep
              data={formData}
              onEdit={handleEdit}
              onSubmit={handleFinalSubmit}
              isLoading={isLoading}
              error={error}
              skipPlanSelection={false}
            />
          )
        default:
          return null
      }
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
            <a href="/login" className="text-muted-foreground hover:text-foreground">Giriş Yap</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Şirketinizi Kaydedin</h1>
              <span className="text-sm text-muted-foreground">
                {currentStep} / {totalSteps}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between mt-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <span
                  key={i + 1}
                  className={`text-xs ${i + 1 <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                >
                  {getStepTitle(i + 1)}
                </span>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {renderStep()}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 space-y-4">
            <p className="text-muted-foreground">
              Zaten hesabınız var mı?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Giriş yapın
              </Link>
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Kayıt olarak{' '}
              <Link href="/terms" className="text-primary hover:text-primary/80 underline">
                Kullanım Şartları
              </Link>{' '}
              ve{' '}
              <Link href="/privacy" className="text-primary hover:text-primary/80 underline">
                Gizlilik Politikası
              </Link>
              'nı kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
export
  default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Sayfa yükleniyor...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}