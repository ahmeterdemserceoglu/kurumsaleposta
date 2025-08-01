'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  is_banned: boolean
  ban_reason?: string
  last_login?: string
  createdAt: string
  company: {
    id: string
    name: string
    plan: string
  }
}

interface BanUserModalProps {
  user: User
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function BanUserModal({ user, onConfirm, onCancel }: BanUserModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(reason.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  const predefinedReasons = [
    'Spam gönderimi',
    'Kötüye kullanım',
    'Hizmet şartları ihlali',
    'Güvenlik ihlali',
    'Ödeme sorunu',
    'Diğer'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Kullanıcıyı Yasakla
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Dikkat!
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      <strong>{user.firstName} {user.lastName}</strong> ({user.email}) kullanıcısını yasaklamak üzeresiniz.
                      Bu işlem geri alınabilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yasaklama Nedeni *
            </label>
            
            {/* Predefined reasons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {predefinedReasons.map((predefinedReason) => (
                <button
                  key={predefinedReason}
                  type="button"
                  onClick={() => setReason(predefinedReason)}
                  className={`text-left px-3 py-2 text-sm border rounded-md transition-colors ${
                    reason === predefinedReason
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {predefinedReason}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Yasaklama nedenini açıklayın..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isSubmitting ? 'Yasaklanıyor...' : 'Kullanıcıyı Yasakla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}