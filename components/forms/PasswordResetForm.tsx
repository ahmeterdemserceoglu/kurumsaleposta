'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { passwordResetSchema, PasswordResetFormData } from '@/lib/validations'

interface PasswordResetFormProps {
  onSubmit: (data: PasswordResetFormData) => void
  isLoading: boolean
}

export function PasswordResetForm({ onSubmit, isLoading }: PasswordResetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          E-posta adresi
        </label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
          placeholder="ornek@sirket.com"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
        <div className="mt-4 bg-muted/50 border border-border rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            <svg className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Şifre sıfırlama linki yedek e-posta adresinize gönderilecektir.
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Gönderiliyor...
            </div>
          ) : (
            'Şifre Sıfırlama Linki Gönder'
          )}
        </button>
      </div>
    </form>
  )
}