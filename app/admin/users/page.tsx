'use client'

import { useState, useEffect } from 'react'
import { UserManagementTable } from '@/components/admin/UserManagementTable'
import { UserFilters } from '@/components/admin/UserFilters'
import { BanUserModal } from '@/components/admin/BanUserModal'

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

interface UserFilters {
  search: string
  role: string
  status: string
  plan: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    plan: ''
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [filters, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...filters
      })

      const response = await fetch(`/api/admin/users?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = (user: User) => {
    setSelectedUser(user)
    setShowBanModal(true)
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
    }
  }

  const handleBanConfirm = async (reason: string) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        setShowBanModal(false)
        setSelectedUser(null)
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error banning user:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <div className="text-sm text-gray-500">
          Toplam {users.length} kullanıcı
        </div>
      </div>

      {/* Filtreler */}
      <UserFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onReset={() => setFilters({ search: '', role: '', status: '', plan: '' })}
      />

      {/* Kullanıcı Tablosu */}
      <UserManagementTable
        users={users}
        loading={loading}
        onBanUser={handleBanUser}
        onUnbanUser={handleUnbanUser}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <BanUserModal
          user={selectedUser}
          onConfirm={handleBanConfirm}
          onCancel={() => {
            setShowBanModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}