import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { TIER_METADATA } from '../lib/subscription-tiers'

const prisma = new PrismaClient()

// Demo amounts follow lib/subscription-tiers.ts (HKD: Starter 148, Growth 538, Studio 1168, Pro 2338)
const GROWTH_PRICE = TIER_METADATA.find((t) => t.tier === 'GROWTH')?.priceMonthly ?? 538

async function main() {
  console.log('Creating demo data...')

  // Create trainer
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@demo.com' },
    update: {},
    create: {
      email: 'trainer@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'John Trainer',
      role: 'TRAINER',
    },
  })

  console.log('✓ Trainer created:', trainer.email)

  // Create trainee (with profile for demo)
  const trainee = await prisma.user.upsert({
    where: { email: 'trainee@demo.com' },
    update: {
      phone: '+1 555-0123',
      age: 28,
      sex: 'Female',
      goals: 'Build strength and improve endurance. Focus on compound lifts.',
      weight: 65.5,
    },
    create: {
      email: 'trainee@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Sarah Trainee',
      role: 'TRAINEE',
      phone: '+1 555-0123',
      age: 28,
      sex: 'Female',
      goals: 'Build strength and improve endurance. Focus on compound lifts.',
      weight: 65.5,
    },
  })

  console.log('✓ Trainee created:', trainee.email)

  // Connect trainer and trainee (so trainer can assign programs)
  await prisma.trainerTraineeConnection.upsert({
    where: {
      trainerId_traineeId: { trainerId: trainer.id, traineeId: trainee.id },
    },
    update: {},
    create: {
      trainerId: trainer.id,
      traineeId: trainee.id,
    },
  })
  console.log('✓ Trainer–trainee connection created')

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Demo Admin',
      role: 'ADMIN',
    },
  })
  console.log('✓ Admin created:', admin.email)

  // Second trainer (on free trial for demo)
  const trainer2 = await prisma.user.upsert({
    where: { email: 'trainer2@demo.com' },
    update: {},
    create: {
      email: 'trainer2@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Jane Trainer',
      role: 'TRAINER',
    },
  })
  console.log('✓ Second trainer created:', trainer2.email)

  // Get exercises
  const benchPress = await prisma.exercise.findUnique({ where: { name: 'Bench Press' } })
  const squat = await prisma.exercise.findUnique({ where: { name: 'Squat' } })
  const deadlift = await prisma.exercise.findUnique({ where: { name: 'Deadlift' } })
  const overheadPress = await prisma.exercise.findUnique({ where: { name: 'Overhead Press' } })

  if (!benchPress || !squat || !deadlift || !overheadPress) {
    console.log('⚠️  Please run seed first: npm run db:seed')
    return
  }

  // Create program (no traineeId; assign via ProgramAssignment)
  const program = await prisma.trainingProgram.create({
    data: {
      name: 'Beginner Strength Program',
      description: '4-week program for building strength and muscle mass',
      duration: 4,
      trainerId: trainer.id,
      exercises: {
        create: [
          {
            exerciseId: benchPress.id,
            sets: 3,
            reps: 10,
            weight: 60,
            restTimeSeconds: 90,
            order: 0,
          },
          {
            exerciseId: squat.id,
            sets: 3,
            reps: 8,
            weight: 80,
            restTimeSeconds: 120,
            order: 1,
          },
          {
            exerciseId: deadlift.id,
            sets: 3,
            reps: 5,
            weight: 100,
            restTimeSeconds: 180,
            order: 2,
          },
          {
            exerciseId: overheadPress.id,
            sets: 3,
            reps: 8,
            weight: 40,
            restTimeSeconds: 90,
            order: 3,
          },
        ],
      },
    },
  })

  await prisma.programAssignment.create({
    data: { programId: program.id, traineeId: trainee.id },
  })

  console.log('✓ Program created:', program.name)

  // Create sample sessions (spread over 3 weeks)
  const today = new Date()
  const sessions = []

  for (let week = 0; week < 3; week++) {
    for (let day = 0; day < 2; day++) {
      const sessionDate = new Date(today)
      sessionDate.setDate(today.getDate() - (week * 7) - (day * 3))
      sessionDate.setHours(10 + day, 0, 0, 0)

      const session = await prisma.trainingSession.create({
        data: {
          programId: program.id,
          traineeId: trainee.id,
          date: sessionDate,
          rpe: 7 + Math.floor(Math.random() * 2),
          notes: `Week ${week + 1}, Session ${day + 1} - Felt ${week === 0 ? 'good' : week === 1 ? 'strong' : 'very strong'} today`,
          exercises: {
            create: [
              {
                exerciseId: benchPress.id,
                sets: 3,
                reps: [10, 10, 9 + week],
                weights: [60 + week * 2.5, 62.5 + week * 2.5, 60 + week * 2.5],
                notes: `Progressive overload - week ${week + 1}`,
              },
              {
                exerciseId: squat.id,
                sets: 3,
                reps: [8, 8, 7 + week],
                weights: [80 + week * 5, 82.5 + week * 5, 80 + week * 5],
                notes: `Form improving`,
              },
              {
                exerciseId: deadlift.id,
                sets: 3,
                reps: [5, 5, 4 + week],
                weights: [100 + week * 5, 102.5 + week * 5, 100 + week * 5],
                notes: `Heavy but manageable`,
              },
              {
                exerciseId: overheadPress.id,
                sets: 3,
                reps: [8, 8, 7 + week],
                weights: [40 + week * 2.5, 42.5 + week * 2.5, 40 + week * 2.5],
                notes: `Shoulder strength building`,
              },
            ],
          },
        },
      })
      sessions.push(session)
    }
  }

  console.log('✓ Sessions created:', sessions.length)

  // Create a second program for variety
  const program2 = await prisma.trainingProgram.create({
    data: {
      name: 'Upper Body Focus',
      description: '3-week upper body specialization program',
      duration: 3,
      trainerId: trainer.id,
      exercises: {
        create: [
          {
            exerciseId: benchPress.id,
            sets: 4,
            reps: 8,
            weight: 65,
            restTimeSeconds: 120,
            order: 0,
          },
          {
            exerciseId: overheadPress.id,
            sets: 3,
            reps: 10,
            weight: 35,
            restTimeSeconds: 90,
            order: 1,
          },
        ],
      },
    },
  })

  await prisma.programAssignment.create({
    data: { programId: program2.id, traineeId: trainee.id },
  })

  console.log('✓ Second program created:', program2.name)

  // Create trainer platform subscription (trainer pays for Growth tier)
  const existingSub = await prisma.trainerSubscription.findFirst({
    where: { trainerId: trainer.id, status: 'ACTIVE' },
  })
  if (!existingSub) {
    await prisma.trainerSubscription.create({
      data: {
        trainerId: trainer.id,
        tier: 'GROWTH',
        status: 'ACTIVE',
        amount: GROWTH_PRICE,
        currency: 'HKD',
        billingInterval: 'MONTHLY',
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    console.log('✓ Trainer subscription created (Growth tier)')
  }

  // Free trial subscription for second trainer (so admin can see and extend)
  const trialEnd = new Date(today)
  trialEnd.setDate(trialEnd.getDate() + 14)
  const existingTrial = await prisma.trainerSubscription.findFirst({
    where: { trainerId: trainer2.id, tier: 'FREE_TRIAL' },
  })
  if (!existingTrial) {
    await prisma.trainerSubscription.create({
      data: {
        trainerId: trainer2.id,
        tier: 'FREE_TRIAL',
        status: 'ACTIVE',
        amount: 0,
        currency: 'HKD',
        billingInterval: 'MONTHLY',
        startDate: today,
        endDate: trialEnd,
      },
    })
    console.log('✓ Free trial subscription created for second trainer')
  }

  // Create sample payments (trainer pays platform)
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        userId: trainer.id,
        amount: GROWTH_PRICE,
        currency: 'HKD',
        status: 'COMPLETED',
        description: 'Growth plan - January',
        createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.payment.create({
      data: {
        userId: trainer.id,
        amount: GROWTH_PRICE,
        currency: 'HKD',
        status: 'COMPLETED',
        description: 'Growth plan - February',
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
  ])
  console.log('✓ Payments created:', payments.length)

  // Demo Stripe config (placeholder price IDs for showcase; no real keys)
  const existingStripeConfig = await prisma.stripeConfig.findFirst()
  if (!existingStripeConfig) {
    await prisma.stripeConfig.create({
      data: {
        stripeSecretKey: null,
        stripeWebhookSecret: null,
        stripePriceIdStarter: 'price_demo_starter',
        stripePriceIdGrowth: 'price_demo_growth',
        stripePriceIdStudio: 'price_demo_studio',
        stripePriceIdPro: 'price_demo_pro',
        stripePriceIdStarter6mo: 'price_demo_starter_6mo',
        stripePriceIdStarter12mo: 'price_demo_starter_12mo',
        stripePriceIdGrowth6mo: 'price_demo_growth_6mo',
        stripePriceIdGrowth12mo: 'price_demo_growth_12mo',
        stripePriceIdStudio6mo: 'price_demo_studio_6mo',
        stripePriceIdStudio12mo: 'price_demo_studio_12mo',
        stripePriceIdPro6mo: 'price_demo_pro_6mo',
        stripePriceIdPro12mo: 'price_demo_pro_12mo',
        stripePublishableKey: null,
      },
    })
    console.log('✓ Demo Stripe config created (placeholder price IDs for Settings showcase)')
  }

  console.log('\n🎉 Demo data created successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('   Admin:    admin@demo.com / demo123')
  console.log('   Trainer:  trainer@demo.com / demo123 (Growth plan)')
  console.log('   Trainer2: trainer2@demo.com / demo123 (Free trial)')
  console.log('   Trainee:  trainee@demo.com / demo123')
  console.log('\n📊 Created:')
  console.log(`   - 1 Admin account`)
  console.log(`   - 2 Trainer accounts`)
  console.log(`   - 1 Trainee account`)
  console.log(`   - 2 Training programs`)
  console.log(`   - ${sessions.length} Training sessions`)
  console.log(`   - 2 Subscriptions (1 Growth, 1 Free trial)`)
  console.log(`   - ${payments.length} Payment records`)
  console.log(`   - 1 Stripe config row (demo placeholders for Admin Settings)`)
}

main()
  .catch((e) => {
    console.error('Error creating demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
