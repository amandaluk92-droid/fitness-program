import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { ProfileForm } from '@/components/trainee/ProfileForm'
import { User } from 'lucide-react'

export default async function TraineeProfilePage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'TRAINEE') {
    redirect('/trainer/dashboard')
  }

  const userId =
    typeof session.user.id === 'string' && session.user.id.trim() !== ''
      ? session.user.id
      : null
  const userEmail =
    typeof session.user.email === 'string' && session.user.email.trim() !== ''
      ? session.user.email
      : null

  if (!userId && !userEmail) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: userEmail! },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      age: true,
      sex: true,
      goals: true,
      weight: true,
      goalWeight: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  const t = await getTranslations('trainee.profile')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <Card title={t('personalDetails')}>
        <ProfileForm
          user={{
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            age: user.age,
            sex: user.sex,
            goals: user.goals,
            weight: user.weight,
            goalWeight: user.goalWeight,
          }}
        />
      </Card>
    </div>
  )
}
