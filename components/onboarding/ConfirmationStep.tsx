'use client'

import { OnboardingData } from '@/app/(auth)/register/page'

interface ConfirmationStepProps {
    data: OnboardingData
    onEdit: (step: number) => void
    onSubmit: () => void
    isLoading: boolean
    error: string | null
    skipPlanSelection?: boolean
}

const getPlanName = (plan: string) => {
    switch (plan) {
        case 'starter': return 'Başlangıç'
        case 'business': return 'İş'
        case 'enterprise': return 'Kurumsal'
        default: return plan
    }
}

const getPlanDetails = (plan: string) => {
    switch (plan) {
        case 'starter': return { accounts: '10', storage: '5 GB', price: '₺99/ay' }
        case 'business': return { accounts: '50', storage: '25 GB', price: '₺299/ay' }
        case 'enterprise': return { accounts: '200', storage: '100 GB', price: '₺799/ay' }
        default: return { accounts: '10', storage: '5 GB', price: '₺99/ay' }
    }
}

export function ConfirmationStep({ data, onEdit, onSubmit, isLoading, error, skipPlanSelection = false }: ConfirmationStepProps) {
    const planDetails = getPlanDetails(data.plan)

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="mx-auto h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Bilgilerinizi Onaylayın
                </h2>
                <p className="text-gray-600">
                    Tüm bilgilerinizi kontrol edin ve hesabınızı oluşturun
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Şirket Bilgileri */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Şirket Bilgileri</h3>
                        </div>
                        <button
                            onClick={() => onEdit(1)}
                            className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Düzenle
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Şirket Adı</p>
                            <p className="text-gray-900 font-semibold">{data.companyName}</p>
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-500">Yedek E-posta</p>
                            <p className="text-gray-900 font-semibold">{data.backupEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Yönetici Bilgileri */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Yönetici Bilgileri</h3>
                        </div>
                        <button
                            onClick={() => onEdit(2)}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Düzenle
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ad Soyad</p>
                            <p className="text-gray-900 font-semibold">{data.adminFirstName} {data.adminLastName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">E-posta Adresi</p>
                            <p className="text-gray-900 font-semibold">{data.adminEmail}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-500">Şifre</p>
                            <p className="text-gray-900 font-semibold">••••••••</p>
                        </div>
                    </div>
                </div>

                {/* Plan Bilgileri */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Seçilen Plan</h3>
                        </div>
                        {!skipPlanSelection && (
                            <button
                                onClick={() => onEdit(3)}
                                className="inline-flex items-center px-3 py-1.5 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                            >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Düzenle
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Plan</p>
                            <p className="text-gray-900 font-semibold">{getPlanName(data.plan)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">E-posta Hesabı</p>
                            <p className="text-gray-900 font-semibold">{planDetails.accounts} hesap</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Depolama</p>
                            <p className="text-gray-900 font-semibold">{planDetails.storage}/hesap</p>
                        </div>
                        <div className="md:col-span-3">
                            <p className="text-sm font-medium text-gray-500">Aylık Ücret</p>
                            <p className="text-2xl font-bold text-purple-600">{planDetails.price}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Onay ve Kayıt Butonu */}
            <div className="pt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <svg className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-green-800 mb-1">Hesabınız oluşturulmaya hazır!</p>
                            <p className="text-sm text-green-700">
                                Tüm bilgilerinizi kontrol ettiniz mi? Hesabınızı oluşturmak için aşağıdaki butona tıklayın.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            Hesap oluşturuluyor...
                        </div>
                    ) : (
                        <>
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Hesabımı Oluştur
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}