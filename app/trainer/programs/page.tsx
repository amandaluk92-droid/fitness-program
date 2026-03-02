import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, FileText, User } from 'lucide-react'

async function getPrograms(trainerId: string) {
  return await prisma.trainingProgram.findMany({
    where: { trainerId },
    include: {
      exercises: {
        include: { exercise: true },
      },
      assignments: {
        include: {
          trainee: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ProgramsPage() {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const programs = await getPrograms(session.user.id)
  const t = await getTranslations('trainer.programs')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/trainer/programs/templates">
            <Button variant="outline">{t('browseTemplates')}</Button>
          </Link>
          <Link href="/trainer/programs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('newProgram')}
            </Button>
          </Link>
        </div>
      </div>

      {programs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t('noPrograms')}</p>
            <div className="flex gap-2 justify-center">
              <Link href="/trainer/programs/templates">
                <Button variant="outline">{t('browseTemplates')}</Button>
              </Link>
              <Link href="/trainer/programs/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createProgram')}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <Link key={program.id} href={`/trainer/programs/${program.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                    {program.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{program.description}</p>
                    )}
                  </div>
                  <FileText className="h-6 w-6 text-primary-500 flex-shrink-0" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      {program.assignments.length === 0
                        ? t('noTraineesAssigned')
                        : program.assignments.length === 1
                          ? program.assignments[0].trainee.name
                          : t('traineesCount', { count: program.assignments.length })}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    {t('exercisesCount', { count: program.exercises.length })}
                  </div>

                  {program.duration && (
                    <div className="text-sm text-gray-600">
                      {t('duration')} <span className="font-medium">{program.duration}</span> {t('weeks')}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className={`text-xs px-2 py-1 rounded-full ${program.isActive ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-600'}`}>
                      {program.isActive ? t('active') : t('inactive')}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(program.createdAt)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
