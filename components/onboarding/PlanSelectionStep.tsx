'use client'

import { useState } from 'react'
import { OnboardingData } from '@/app/(auth)/register/page'

interface PlanSelectionStepProps {
  data: OnboardingData
  onComplete: (data: Partial<OnboardingData>) => void
  isEditing?: boolean
}

const plans = [
  {
    id: 'starter' as const,
    name: 'Başlangıç',
    price: '₺99',
    period: '/ay',
    description: 'Küçük ekipler için ideal',
    features: [
      '10 e-posta hesabı',
      '5 GB depolama/hesap',
      'Temel güvenlik',
      'E-posta desteği',
    ],
    color: 'from-green-500 to-emerald-600',
    popular: false,
  },
  {
    id: 'business' as const,
    name: 'İş',
    price: '₺299',
    period: '/ay',
    description: 'Büyüyen şirketler için',
    features: [
      '50 e-posta hesabı',
      '25 GB depolama/hesap',
      'Gelişmiş güvenlik',
      'Öncelikli destek',
      'Yedekleme servisi',
    ],
    color: 'from-blue-500 to-indigo-600',
    popular: true,
  },
  {
    id: 'enterprise' as const,
    name: 'Kurumsal',
    price: '₺799',
    period: '/ay',
    description: 'Büyük organizasyonlar için',
    features: [
      '200 e-posta hesabı',
      '100 GB depolama/hesap',
      'Kurumsal güvenlik',
      '7/24 telefon desteği',
      'Özel yedekleme',
      'API erişimi',
    ],
    color: 'from-purple-500 to-pink-600',
    popular: false,
  },
]

export function PlanSelectionStep({ data, onComplete, isEditing }: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'business' | 'enterprise'>(data.plan)

  const handleSubmit = () => {
    onComplete({ plan: selectedPlan })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Plan Seçimi
        </h2>
        <p className="text-gray-600">
          İhtiyaçlarınıza uygun planı seçin
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 ${
              selectedPlan === plan.id
                ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
                  Popüler
                </span>
              </div>
            )}

            <div className="text-center">
              <div className={`mx-auto h-12 w-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>

              <ul className="space-y-3 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6">
        <button
          onClick={handleSubmit}
          className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isEditing ? (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Güncelle
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Devam Et
            </>
          )}
        </button>
      </div>
    </div>
  )
}