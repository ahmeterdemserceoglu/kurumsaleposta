'use client'

import { useState } from 'react'

interface Ticket {
  id: string
  companyId: string
  companyName: string
  userId: string
  userEmail: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'general' | 'feature_request'
  assigned_to: string | null
  assignedAdminName: string | null
  resolved_at: string | null
  createdAt: string
  updatedAt: string
}

interface TicketModalProps {
  ticket: Ticket
  onUpdate: (ticketId: string, updates: any) => void
  onClose: () => void
}

export function TicketModal({ ticket, onUpdate, onClose }: TicketModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'response'>('details')
  const [updates, setUpdates] = useState({
    status: ticket.status,
    priority: ticket.priority,
    assigned_to: ticket.assigned_to || '',
    response: ''
  })

  const handleUpdate = () => {
    const updateData: any = {
      status: updates.status,
      priority: updates.priority,
      assigned_to: updates.assigned_to || null
    }

    if (updates.response.trim()) {
      updateData.response = updates.response
    }

    if (updates.status === 'resolved' && !ticket.resolved_at) {
      updateData.resolved_at = new Date().toISOString()
    }

    onUpdate(ticket.id, updateData)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'open': 'text-yellow-600',
      'in_progress': 'text-blue-600',
      'resolved': 'text-green-600',
      'closed': 'text-gray-600'
    }
    return colors[status as keyof typeof colors] || colors.open
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-gray-600',
      'medium': 'text-blue-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">
            Destek Talebi #{ticket.id.slice(-8)}
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
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Talep Detayları
            </button>
            <button
              onClick={() => setActiveTab('response')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'response'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Yanıt & Güncelleme
            </button>
          </nav>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Talep Bilgileri</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Konu:</span>
                    <p className="text-sm text-gray-900 mt-1">{ticket.subject}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Açıklama:</span>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Durum:</span>
                      <span className={`ml-2 text-sm font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Açık' : 
                         ticket.status === 'in_progress' ? 'İşlemde' :
                         ticket.status === 'resolved' ? 'Çözüldü' : 'Kapatıldı'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Öncelik:</span>
                      <span className={`ml-2 text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'low' ? 'Düşük' :
                         ticket.priority === 'medium' ? 'Orta' :
                         ticket.priority === 'high' ? 'Yüksek' : 'Acil'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Müşteri Bilgileri</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Şirket:</span>
                    <p className="text-sm text-gray-900 mt-1">{ticket.companyName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">E-posta:</span>
                    <p className="text-sm text-gray-900 mt-1">{ticket.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Kategori:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {ticket.category === 'technical' ? 'Teknik' :
                       ticket.category === 'billing' ? 'Faturalama' :
                       ticket.category === 'general' ? 'Genel' : 'Özellik İsteği'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Oluşturulma:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  {ticket.resolved_at && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Çözülme:</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(ticket.resolved_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={updates.status}
                  onChange={(e) => setUpdates(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Açık</option>
                  <option value="in_progress">İşlemde</option>
                  <option value="resolved">Çözüldü</option>
                  <option value="closed">Kapatıldı</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öncelik
                </label>
                <select
                  value={updates.priority}
                  onChange={(e) => setUpdates(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="urgent">Acil</option>
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Atanan Admin
                </label>
                <select
                  value={updates.assigned_to}
                  onChange={(e) => setUpdates(prev => ({ ...prev, assigned_to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Atanmamış</option>
                  <option value="admin1">Admin 1</option>
                  <option value="admin2">Admin 2</option>
                  {/* Admin listesi buraya eklenebilir */}
                </select>
              </div>
            </div>

            {/* Response */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yanıt (Opsiyonel)
              </label>
              <textarea
                value={updates.response}
                onChange={(e) => setUpdates(prev => ({ ...prev, response: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Müşteriye gönderilecek yanıt..."
              />
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
          <button
            onClick={handleUpdate}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Güncelle
          </button>
        </div>
      </div>
    </div>
  )
}