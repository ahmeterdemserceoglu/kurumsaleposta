'use client'

import { useState, useEffect } from 'react'
import { SettingsSection } from '@/components/admin/SettingsSection'

interface SystemSettings {
  site_name: string
  site_description: string
  maintenance_mode: boolean
  max_login_attempts: number
  session_timeout: number
  email_verification_required: boolean
  default_plan: string
  trial_period_days: number
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_from: string
  backup_enabled: boolean
  backup_frequency: string
  log_level: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (sectionSettings: Partial<SystemSettings>) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionSettings)
      })

      if (response.ok) {
        console.log('Settings saved successfully')
        fetchSettings() // Refresh settings
      } else {
        console.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'Genel', icon: '⚙️' },
    { id: 'security', name: 'Güvenlik', icon: '🔒' },
    { id: 'email', name: 'E-posta', icon: '📧' },
    { id: 'backup', name: 'Yedekleme', icon: '💾' },
    { id: 'logs', name: 'Loglar', icon: '📋' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Ayarlar yüklenemedi</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sistem Ayarları</h1>
        <div className="text-sm text-gray-500">
          Son güncelleme: {new Date().toLocaleString('tr-TR')}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <SettingsSection
              title="Genel Ayarlar"
              description="Site geneli ayarları ve temel konfigürasyonlar"
              settings={{
                site_name: settings.site_name,
                site_description: settings.site_description,
                maintenance_mode: settings.maintenance_mode,
                default_plan: settings.default_plan,
                trial_period_days: settings.trial_period_days
              }}
              onSave={handleSaveSettings}
              saving={saving}
              fields={[
                { key: 'site_name', label: 'Site Adı', type: 'text', required: true },
                { key: 'site_description', label: 'Site Açıklaması', type: 'textarea' },
                { key: 'maintenance_mode', label: 'Bakım Modu', type: 'boolean' },
                { 
                  key: 'default_plan', 
                  label: 'Varsayılan Plan', 
                  type: 'select',
                  options: [
                    { value: 'starter', label: 'Başlangıç' },
                    { value: 'business', label: 'İş' },
                    { value: 'enterprise', label: 'Kurumsal' }
                  ]
                },
                { key: 'trial_period_days', label: 'Deneme Süresi (Gün)', type: 'number', min: 0, max: 365 }
              ]}
            />
          )}

          {activeTab === 'security' && (
            <SettingsSection
              title="Güvenlik Ayarları"
              description="Kullanıcı güvenliği ve oturum yönetimi ayarları"
              settings={{
                max_login_attempts: settings.max_login_attempts,
                session_timeout: settings.session_timeout,
                email_verification_required: settings.email_verification_required
              }}
              onSave={handleSaveSettings}
              saving={saving}
              fields={[
                { key: 'max_login_attempts', label: 'Maksimum Giriş Denemesi', type: 'number', min: 1, max: 10 },
                { key: 'session_timeout', label: 'Oturum Zaman Aşımı (Dakika)', type: 'number', min: 30, max: 1440 },
                { key: 'email_verification_required', label: 'E-posta Doğrulama Zorunlu', type: 'boolean' }
              ]}
            />
          )}

          {activeTab === 'email' && (
            <SettingsSection
              title="E-posta Ayarları"
              description="SMTP sunucu ayarları ve e-posta konfigürasyonu"
              settings={{
                smtp_host: settings.smtp_host,
                smtp_port: settings.smtp_port,
                smtp_user: settings.smtp_user,
                smtp_from: settings.smtp_from
              }}
              onSave={handleSaveSettings}
              saving={saving}
              fields={[
                { key: 'smtp_host', label: 'SMTP Sunucu', type: 'text', required: true },
                { key: 'smtp_port', label: 'SMTP Port', type: 'number', min: 1, max: 65535 },
                { key: 'smtp_user', label: 'SMTP Kullanıcı', type: 'text' },
                { key: 'smtp_from', label: 'Gönderen E-posta', type: 'email', required: true }
              ]}
            />
          )}

          {activeTab === 'backup' && (
            <SettingsSection
              title="Yedekleme Ayarları"
              description="Otomatik yedekleme ve veri koruma ayarları"
              settings={{
                backup_enabled: settings.backup_enabled,
                backup_frequency: settings.backup_frequency
              }}
              onSave={handleSaveSettings}
              saving={saving}
              fields={[
                { key: 'backup_enabled', label: 'Otomatik Yedekleme', type: 'boolean' },
                { 
                  key: 'backup_frequency', 
                  label: 'Yedekleme Sıklığı', 
                  type: 'select',
                  options: [
                    { value: 'daily', label: 'Günlük' },
                    { value: 'weekly', label: 'Haftalık' },
                    { value: 'monthly', label: 'Aylık' }
                  ]
                }
              ]}
            />
          )}

          {activeTab === 'logs' && (
            <SettingsSection
              title="Log Ayarları"
              description="Sistem logları ve hata kayıtları ayarları"
              settings={{
                log_level: settings.log_level
              }}
              onSave={handleSaveSettings}
              saving={saving}
              fields={[
                { 
                  key: 'log_level', 
                  label: 'Log Seviyesi', 
                  type: 'select',
                  options: [
                    { value: 'error', label: 'Sadece Hatalar' },
                    { value: 'warn', label: 'Uyarılar ve Hatalar' },
                    { value: 'info', label: 'Bilgi, Uyarı ve Hatalar' },
                    { value: 'debug', label: 'Tüm Loglar (Debug)' }
                  ]
                }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  )
}