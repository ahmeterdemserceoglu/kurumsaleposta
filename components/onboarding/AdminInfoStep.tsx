'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { OnboardingData } from '@/app/(auth)/register/page'

const adminInfoSchema = z.object({
  adminFirstName: z.string().min(1, "Ad gereklidir"),
  adminLastName: z.string().min(1, "Soyad gereklidir"),
  adminEmail: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
})

type AdminInfoData = z.infer<typeof adminInfoSchema>

interface AdminInfoStepProps {
  data: OnboardingData
  onComplete: (data: Partial<OnboardingData>) => void
  isEditing?: boolean
}

export function AdminInfoStep({ data, onComplete, isEditing }: AdminInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AdminInfoData>({
    resolver: zodResolver(adminInfoSchema),
    defaultValues: {
      adminFirstName: data.adminFirstName,
      adminLastName: data.adminLastName,
      adminEmail: data.adminEmail,
      password: data.password,
    }
  })

  const onSubmit = (formData: AdminInfoData) => {
    onComplete(formData)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Yönetici Bilgileri
        </h2>
        <p className="text-muted-foreground">
          Ana yönetici hesabınızı oluşturun
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="adminFirstName" className="block text-sm font-medium text-foreground mb-2">
              Ad
            </label>
            <input
              {...register('adminFirstName')}
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              placeholder="Adınız"
            />
            {errors.adminFirstName && (
              <p className="mt-2 text-sm text-destructive">
                {errors.adminFirstName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="adminLastName" className="block text-sm font-medium text-foreground mb-2">
              Soyad
            </label>
            <input
              {...register('adminLastName')}
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              placeholder="Soyadınız"
            />
            {errors.adminLastName && (
              <p className="mt-2 text-sm text-destructive">
                {errors.adminLastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="adminEmail" className="block text-sm font-medium text-foreground mb-2">
            E-posta Adresi
          </label>
          <input
            {...register('adminEmail')}
            type="email"
            autoComplete="email"
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="admin@sirketadi.com"
          />
          {errors.adminEmail && (
            <p className="mt-2 text-sm text-destructive">
              {errors.adminEmail.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Şifre
          </label>
          <input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="Güçlü bir şifre oluşturun"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
          <div className="mt-3 bg-muted/50 border border-border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <svg className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam içermelidir.
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