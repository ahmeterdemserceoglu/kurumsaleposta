'use client'

import { useState } from 'react'

interface CreateNotificationModalProps {
  onSubmit: (data: any) => void
  onClose: () => void
}

export function CreateNotificationModal({ onSubmit, onClose }: CreateNotificationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success',
    target: 'all' as 'all' | 'admins' | 'users' | 'company',
    targetId: '',
    expiresAt: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim() && formData.message.trim()) {
      onSubmit({
        ...formData,
        expiresAt: formData.expiresAt || null,
        targetId: formData.target === 'company' ? formData.targetId : null
      })
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Yeni Bildirim Oluştur
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bildirim başlığı"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesaj *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bildirim mesajı"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="info">Bilgi</option>
                <option value="warning">Uyarı</option>
                <option value="error">Hata</option>
                <option value="success">Başarı</option>
              </select>
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hedef
              </label>
              <select
                value={formData.target}
                onChange={(e) => handleChange('target', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Herkese</option>
                <option value="admins">Adminlere</option>
                <option value="users">Kullanıcılara</option>
                <option value="company">Belirli Şirkete</option>
              </select>
            </div>

            {/* Target ID (only for company) */}
            {formData.target === 'company' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket ID
                </label>
                <input
                  type="text"
                  value={formData.targetId}
                  onChange={(e) => handleChange('targetId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şirket ID'si"
                />
              </div>
            )}

            {/* Expires At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi (Opsiyonel)
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => handleChange('expiresAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Oluştur
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}