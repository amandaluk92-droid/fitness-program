import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { UserRole } from '@prisma/client'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

/**
 * Demo mode: only available in development (never in production).
 * For local development, allows unauthenticated access using a demo trainee account.
 */
const DEMO_TRAINEE_EMAIL = 'trainee@demo.com'
const isDemoAllowed = process.env.DEMO_MODE === 'true'

/** For demo: when no real session, return session for demo trainee so app works without login */
async function getDemoSession(): Promise<Session | null> {
  if (!isDemoAllowed) return null
  const user = await prisma.user.findUnique({
    where: { email: DEMO_TRAINEE_EMAIL },
  })
  if (!user) return null
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

/** Use real session if logged in; in development only, fall back to demo trainee session */
export async function getSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  if (session) return session
  if (isDemoAllowed) return getDemoSession()
  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const id = token.id ?? token.sub
        if (id != null && typeof id === 'string') {
          session.user.id = id
        }
        if (token.role != null) {
          session.user.role = token.role as UserRole
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
