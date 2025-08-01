'use client'

import { useState, useEffect } from 'react'
import { CompanyTable } from '@/components/admin/CompanyTable'
import { CompanyFilters } from '@/components/admin/CompanyFilters'
import { CompanyModal } from '@/components/admin/CompanyModal'

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

interface CompanyFilters {
  search: string
  status: string
  size: string
  industry: string
  subscription_plan: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    status: '',
    size: '',
    industry: '',
    subscription_plan: ''
  })
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCompanies()
  }, [filters, currentPage])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...filters
      })

      const response = await fetch(`/api/admin/companies?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyUpdate = async (companyId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        fetchCompanies() // Refresh the list
        setShowCompanyModal(false)
        setSelectedCompany(null)
      }
    } catch (error) {
      console.error('Error updating company:', error)
    }
  }

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setShowCompanyModal(true)
  }

  const handleSuspendCompany = async (companyId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        fetchCompanies() // Refresh the list
      }
    } catch (error) {
      console.error('Error suspending company:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Şirket Yönetimi</h1>
        <div className="text-sm text-gray-500">
          Toplam {companies.length} şirket
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Şirket</p>
              <p className="text-2xl font-semibold text-gray-900">
                {companies.length}
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
              <p className="text-sm font-medium text-gray-600">Aktif Şirket</p>
              <p className="text-2xl font-semibold text-gray-900">
                {companies.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Askıda</p>
              <p className="text-2xl font-semibold text-gray-900">
                {companies.filter(c => c.status === 'suspended').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kurumsal</p>
              <p className="text-2xl font-semibold text-gray-900">
                {companies.filter(c => c.size === 'enterprise').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <CompanyFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onReset={() => setFilters({ search: '', status: '', size: '', industry: '', subscription_plan: '' })}
      />

      {/* Company Tablosu */}
      <CompanyTable
        companies={companies}
        loading={loading}
        onViewCompany={handleViewCompany}
        onSuspendCompany={handleSuspendCompany}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Company Modal */}
      {showCompanyModal && selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onUpdate={handleCompanyUpdate}
          onClose={() => {
            setShowCompanyModal(false)
            setSelectedCompany(null)
          }}
        />
      )}
    </div>
  )
}