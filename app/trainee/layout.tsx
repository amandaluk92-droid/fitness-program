import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/shared/Sidebar'
import { MobileNav } from '@/components/shared/MobileNav'

export default async function TraineeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'TRAINEE') {
    redirect('/trainer/dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar role="TRAINEE" userName={session.user.name} />
      </div>
      <MobileNav role="TRAINEE" userName={session.user.name} />
      <main id="main-content" className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
