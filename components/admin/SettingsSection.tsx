'use client'

import { useState } from 'react'

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'email'
  required?: boolean
  min?: number
  max?: number
  options?: { value: string; label: string }[]
}

interface SettingsSectionProps {
  title: string
  description: string
  settings: Record<string, any>
  onSave: (settings: Record<string, any>) => void
  saving: boolean
  fields: FieldConfig[]
}

export function SettingsSection({
  title,
  description,
  settings,
  onSave,
  saving,
  fields
}: SettingsSectionProps) {
  const [formData, setFormData] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value }
    setFormData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(settings))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setHasChanges(false)
  }

  const handleReset = () => {
    setFormData(settings)
    setHasChanges(false)
  }

  const renderField = (field: FieldConfig) => {
    const value = formData[field.key]

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(field.key, parseInt(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(field.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              {value ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        )

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          >
            <option value="">Seçiniz...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-yellow-800">Kaydedilmemiş değişiklikleriniz var</span>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Geri Al
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            Sıfırla
          </button>
          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}