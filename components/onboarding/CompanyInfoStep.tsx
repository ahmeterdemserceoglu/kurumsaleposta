'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { OnboardingData } from '@/app/(auth)/register/page'

const companyInfoSchema = z.object({
  companyName: z.string().min(2, "Şirket adı en az 2 karakter olmalıdır"),
  backupEmail: z.string().email("Geçerli bir e-posta adresi girin"),
})

type CompanyInfoData = z.infer<typeof companyInfoSchema>

interface CompanyInfoStepProps {
  data: OnboardingData
  onComplete: (data: Partial<OnboardingData>) => void
  isEditing?: boolean
}

export function CompanyInfoStep({ data, onComplete, isEditing }: CompanyInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CompanyInfoData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: data.companyName,
      backupEmail: data.backupEmail,
    }
  })

  const onSubmit = (formData: CompanyInfoData) => {
    onComplete(formData)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Şirket Bilgileri
        </h2>
        <p className="text-muted-foreground">
          Şirketinizin temel bilgilerini girin
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
            Şirket Adı
          </label>
          <input
            {...register('companyName')}
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="Şirket Adı A.Ş."
          />
          {errors.companyName && (
            <p className="mt-2 text-sm text-destructive">
              {errors.companyName.message}
            </p>
          )}
        </div>



        <div>
          <label htmlFor="backupEmail" className="block text-sm font-medium text-foreground mb-2">
            Yedek E-posta Adresi
          </label>
          <input
            {...register('backupEmail')}
            type="email"
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="yedek@gmail.com"
          />
          {errors.backupEmail && (
            <p className="mt-2 text-sm text-destructive">
              {errors.backupEmail.message}
            </p>
          )}
          <div className="mt-3 bg-muted/50 border border-border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <svg className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bu adres şifre sıfırlama ve önemli bildirimler için kullanılacaktır.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            {isEditing ? 'Güncelle' : 'Devam Et'}
          </button>
        </div>
      </form>
    </div>
  )
}