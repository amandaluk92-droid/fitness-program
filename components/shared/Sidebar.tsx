'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Users,
  Calendar,
  TrendingUp,
  LogOut,
  FileText,
  User,
  CreditCard,
  DollarSign,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface NavItem {
  nameKey: keyof typeof sidebarKeys
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const sidebarKeys = {
  dashboard: true,
  profile: true,
  sessions: true,
  progress: true,
  subscription: true,
  programs: true,
  trainees: true,
  users: true,
  subscriptions: true,
  payments: true,
  reports: true,
  settings: true,
} as const

const adminNavItems: NavItem[] = [
  { nameKey: 'dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { nameKey: 'users', href: '/admin/users', icon: Users },
  { nameKey: 'subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { nameKey: 'payments', href: '/admin/payments', icon: DollarSign },
  { nameKey: 'reports', href: '/admin/reports', icon: FileText },
  { nameKey: 'settings', href: '/admin/settings', icon: Settings },
]

const trainerNavItems: NavItem[] = [
  { nameKey: 'dashboard', href: '/trainer/dashboard', icon: LayoutDashboard },
  { nameKey: 'subscription', href: '/trainer/subscription', icon: CreditCard },
  { nameKey: 'programs', href: '/trainer/programs', icon: FileText },
  { nameKey: 'trainees', href: '/trainer/trainees', icon: Users },
  { nameKey: 'progress', href: '/trainer/progress', icon: TrendingUp },
]

const traineeNavItems: NavItem[] = [
  { nameKey: 'dashboard', href: '/trainee/dashboard', icon: LayoutDashboard },
  { nameKey: 'profile', href: '/trainee/profile', icon: User },
  { nameKey: 'sessions', href: '/trainee/sessions', icon: Calendar },
  { nameKey: 'progress', href: '/trainee/progress', icon: TrendingUp },
]

interface SidebarProps {
  role: 'TRAINER' | 'TRAINEE' | 'ADMIN'
  userName: string
  /** When true, hide subscription/payments nav items */
  paymentsDisabled?: boolean
}

export function Sidebar({ role, userName, paymentsDisabled = false }: SidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('sidebar')

  const adminItems = paymentsDisabled
    ? adminNavItems.filter((i) => i.nameKey !== 'subscriptions' && i.nameKey !== 'payments')
    : adminNavItems
  const trainerItems = paymentsDisabled
    ? trainerNavItems.filter((i) => i.nameKey !== 'subscription')
    : trainerNavItems

  const navItems =
    role === 'ADMIN'
      ? adminItems
      : role === 'TRAINER'
        ? trainerItems
        : traineeNavItems

  const roleLabel =
    role === 'ADMIN'
      ? t('roleAdmin')
      : role === 'TRAINER'
        ? t('roleTrainer')
        : t('roleTrainee')

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-center w-full p-6 border-b border-gray-200">
        <Link href={role === 'ADMIN' ? '/admin/dashboard' : role === 'TRAINER' ? '/trainer/dashboard' : '/trainee/dashboard'} className="block w-full">
          <Image
            src="/axio-logo.png"
            alt="Axio"
            width={323}
            height={90}
            className="w-full h-auto object-contain"
            priority
          />
        </Link>
      </div>

      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.nameKey)}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">{roleLabel}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('signOut')}
        </Button>
      </div>
    </div>
  )
}
