import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { LandingPage } from '@/components/landing/LandingPage'

export default async function Home() {
  const session = await getSession()

  if (!session) {
    return <LandingPage />
  }

  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }
  if (session.user.role === 'TRAINER') {
    redirect('/trainer/dashboard')
  }
  redirect('/trainee/dashboard')
}
