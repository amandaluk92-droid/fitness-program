import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/shared/Sidebar'
import { MobileNav } from '@/components/shared/MobileNav'
import { isPaymentsDisabled } from '@/lib/trainer-limits'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar
          role="ADMIN"
          userName={session.user.name}
          paymentsDisabled={isPaymentsDisabled()}
        />
      </div>
      <MobileNav role="ADMIN" userName={session.user.name} paymentsDisabled={isPaymentsDisabled()} />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
