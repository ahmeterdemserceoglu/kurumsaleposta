'use client'

import { useState } from 'react'

interface Company {
  id: string
  name: string
  email: string
  phone: string
  website: string
  industry: string
  size: 'small' | 'medium' | 'large' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended'
  subscription_plan: string
  subscription_status: string
  total_users: number
  total_emails_sent: number
  last_login: string
  createdAt: string
}

interface CompanyModalProps {
  company: Company
  onUpdate: (companyId: string, updates: any) => void
  onClose: () => void
}

export function CompanyModal({ company, onUpdate, onClose }: CompanyModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'users' | 'subscription' | 'activity'>('details')
  const [updates, setUpdates] = useState({
    status: company.status,
    size: company.size,
    industry: company.industry,
    notes: ''
  })

  const handleUpdate = () => {
    const updateData: any = {
      status: updates.status,
      size: updates.size,
      industry: updates.industry
    }

    if (updates.notes.trim()) {
      updateData.admin_notes = updates.notes
    }

    onUpdate(company.id, updateData)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'text-green-600',
      'inactive': 'text-gray-600',
      'suspended': 'text-red-600'
    }
    return colors[status as keyof typeof colors] || colors.inactive
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">
            {company.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'details', name: 'Şirket Detayları', icon: '🏢' },
              { id: 'users', name: 'Kullanıcılar', icon: '👥' },
              { id: 'subscription', name: 'Abonelik', icon: '📊' },
              { id: 'activity', name: 'Aktivite', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Şirket Adı:</span>
                    <p className="text-sm text-gray-900 mt-1">{company.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">E-posta:</span>
                    <p className="text-sm text-gray-900 mt-1">{company.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Telefon:</span>
                    <p className="text-sm text-gray-900 mt-1">{company.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Website:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {company.website}
                        </a>
                      ) : 'Belirtilmemiş'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Durum:</span>
                      <span className={`ml-2 text-sm font-medium ${getStatusColor(company.status)}`}>
                        {company.status === 'active' ? 'Aktif' : 
                         company.status === 'inactive' ? 'Pasif' : 'Askıda'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">İstatistikler</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Toplam Kullanıcı:</span>
                    <p className="text-sm text-gray-900 mt-1">{company.total_users}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Gönderilen E-posta:</span>
                    <p className="text-sm text-gray-900 mt-1">{company.total_emails_sent.toLocaleString('tr-TR')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Sektör:</span>
                    <p className="text-sm text-gray-900 mt-1">{company.industry}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Şirket Boyutu:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {company.size === 'small' ? 'Küçük' :
                       company.size === 'medium' ? 'Orta' :
                       company.size === 'large' ? 'Büyük' : 'Kurumsal'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Kayıt Tarihi:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Son Giriş:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {company.last_login ? new Date(company.last_login).toLocaleDateString('tr-TR') : 'Hiç'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Şirket Güncelle</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={updates.status}
                    onChange={(e) => setUpdates(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="suspended">Askıda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boyut
                  </label>
                  <select
                    value={updates.size}
                    onChange={(e) => setUpdates(prev => ({ ...prev, size: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Küçük</option>
                    <option value="medium">Orta</option>
                    <option value="large">Büyük</option>
                    <option value="enterprise">Kurumsal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sektör
                  </label>
                  <select
                    value={updates.industry}
                    onChange={(e) => setUpdates(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="technology">Teknoloji</option>
                    <option value="finance">Finans</option>
                    <option value="healthcare">Sağlık</option>
                    <option value="education">Eğitim</option>
                    <option value="retail">Perakende</option>
                    <option value="manufacturing">İmalat</option>
                    <option value="consulting">Danışmanlık</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notları (Opsiyonel)
                </label>
                <textarea
                  value={updates.notes}
                  onChange={(e) => setUpdates(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şirket hakkında notlar..."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Kullanıcılar</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">Kullanıcı listesi burada gösterilecek</p>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Abonelik Bilgileri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Mevcut Plan</h5>
                <p className="text-2xl font-bold text-blue-600">{company.subscription_plan}</p>
                <p className="text-sm text-gray-500 mt-1">Durum: {company.subscription_status}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Kullanım</h5>
                <p className="text-sm text-gray-600">E-posta Gönderimi</p>
                <p className="text-lg font-semibold">{company.total_emails_sent.toLocaleString('tr-TR')}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Son Aktiviteler</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">Aktivite geçmişi burada gösterilecek</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            İptal
          </button>
          {activeTab === 'details' && (
            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Güncelle
            </button>
          )}
        </div>
      </div>
    </div>
  )
}