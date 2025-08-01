import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminGuard } from '@/components/admin/AdminGuard'
export const metadata = {
  title: 'Admin Panel - İnf İletişim',
  description: 'Admin yönetim paneli',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="lg:ml-64">
          <AdminHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}