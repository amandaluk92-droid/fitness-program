import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx tsx prisma/scripts/promote-admin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  if (user.role === 'ADMIN') {
    console.log(`${email} is already an admin.`)
    return
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  })

  console.log(`Successfully promoted ${email} to admin.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
