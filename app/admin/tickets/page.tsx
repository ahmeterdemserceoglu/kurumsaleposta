'use client'

import { useState, useEffect } from 'react'
import { TicketTable } from '@/components/admin/TicketTable'
import { TicketFilters } from '@/components/admin/TicketFilters'
import { TicketModal } from '@/components/admin/TicketModal'

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

interface TicketFilters {
  search: string
  status: string
  priority: string
  category: string
  assigned_to: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TicketFilters>({
    search: '',
    status: '',
    priority: '',
    category: '',
    assigned_to: ''
  })
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTickets()
  }, [filters, currentPage])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...filters
      })

      const response = await fetch(`/api/admin/tickets?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTicketUpdate = async (ticketId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        fetchTickets() // Refresh the list
        setShowTicketModal(false)
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowTicketModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Destek Talepleri</h1>
        <div className="text-sm text-gray-500">
          Toplam {tickets.length} talep
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Açık Talepler</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'open').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">İşlemde</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Acil Talepler</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Çözüldü</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <TicketFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onReset={() => setFilters({ search: '', status: '', priority: '', category: '', assigned_to: '' })}
      />

      {/* Ticket Tablosu */}
      <TicketTable
        tickets={tickets}
        loading={loading}
        onViewTicket={handleViewTicket}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onUpdate={handleTicketUpdate}
          onClose={() => {
            setShowTicketModal(false)
            setSelectedTicket(null)
          }}
        />
      )}
    </div>
  )
}