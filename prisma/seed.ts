import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample exercises (base + GBC + rehab)
  const exercises = [
    // Base
    { name: 'Bench Press', description: 'Chest exercise', muscleGroup: 'Chest' },
    { name: 'Squat', description: 'Leg exercise', muscleGroup: 'Legs' },
    { name: 'Deadlift', description: 'Full body exercise', muscleGroup: 'Back' },
    { name: 'Overhead Press', description: 'Shoulder exercise', muscleGroup: 'Shoulders' },
    { name: 'Barbell Row', description: 'Back exercise', muscleGroup: 'Back' },
    { name: 'Pull-ups', description: 'Back and arm exercise', muscleGroup: 'Back' },
    { name: 'Dips', description: 'Triceps and chest exercise', muscleGroup: 'Arms' },
    { name: 'Leg Press', description: 'Leg exercise', muscleGroup: 'Legs' },
    { name: 'Bicep Curls', description: 'Arm exercise', muscleGroup: 'Arms' },
    { name: 'Tricep Extensions', description: 'Arm exercise', muscleGroup: 'Arms' },
    // GBC
    { name: 'Chin-up', description: 'Back and bicep exercise', muscleGroup: 'Back' },
    { name: 'Leg Curl', description: 'Hamstring exercise', muscleGroup: 'Legs' },
    { name: 'Calf Raise', description: 'Calf exercise', muscleGroup: 'Legs' },
    { name: 'Cable Row', description: 'Back exercise', muscleGroup: 'Back' },
    { name: 'Lat Pulldown', description: 'Back exercise', muscleGroup: 'Back' },
    // Rehab
    { name: 'Band External Rotation', description: 'Rotator cuff strengthening', muscleGroup: 'Shoulders' },
    { name: 'Wall Push-up', description: 'Low-intensity chest and triceps', muscleGroup: 'Chest' },
    { name: 'Bird Dog', description: 'Core and lower back stability', muscleGroup: 'Core' },
    { name: 'Dead Bug', description: 'Core stability', muscleGroup: 'Core' },
    { name: 'Quad Set', description: 'Quadriceps isometric', muscleGroup: 'Legs' },
    { name: 'Straight Leg Raise', description: 'Hip flexor and quad', muscleGroup: 'Legs' },
    { name: 'Mini Squat', description: 'Knee-friendly squat progression', muscleGroup: 'Legs' },
    { name: 'Clam Shell', description: 'Hip external rotation', muscleGroup: 'Hips' },
    { name: 'Hip Bridge', description: 'Glute and hamstring', muscleGroup: 'Legs' },
    { name: 'Step-down', description: 'Knee control and strength', muscleGroup: 'Legs' },
    { name: 'Cat-Cow', description: 'Spine mobility', muscleGroup: 'Core' },
    { name: 'Prone Y/T', description: 'Shoulder stabilization', muscleGroup: 'Shoulders' },
    { name: 'Lunge', description: 'Lower body strength', muscleGroup: 'Legs' },
  ]

  const exerciseMap: Record<string, string> = {}
  for (const exercise of exercises) {
    const created = await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: exercise,
    })
    exerciseMap[exercise.name] = created.id
  }

  // GBC 12-Week Body Recomposition (4 days/week, alternating upper/lower supersets, 45-60s rest)
  const gbc12Week = await prisma.programTemplate.upsert({
    where: { id: 'template-gbc-12week' },
    update: {},
    create: {
      id: 'template-gbc-12week',
      name: 'GBC 12-Week Body Recomposition',
      description: 'German Body Composition method: compound supersets, 10-15 reps, 45-60s rest. Alternating upper/lower. 4 days/week.',
      duration: 12,
      category: 'GBC',
      injuryType: null,
      isActive: true,
    },
  })

  await prisma.programTemplateExercise.deleteMany({ where: { templateId: gbc12Week.id } })
  await prisma.programTemplateExercise.createMany({
    data: [
      // Day 1 - Lower + Upper supersets
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Squat'], sets: 4, reps: 12, restTimeSeconds: 50, order: 0, workoutDayIndex: 1 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Bench Press'], sets: 4, reps: 12, restTimeSeconds: 50, order: 1, workoutDayIndex: 1 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Leg Press'], sets: 4, reps: 12, restTimeSeconds: 50, order: 2, workoutDayIndex: 1 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Overhead Press'], sets: 4, reps: 12, restTimeSeconds: 50, order: 3, workoutDayIndex: 1 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Leg Curl'], sets: 4, reps: 12, restTimeSeconds: 50, order: 4, workoutDayIndex: 1 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Cable Row'], sets: 4, reps: 12, restTimeSeconds: 50, order: 5, workoutDayIndex: 1 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Calf Raise'], sets: 3, reps: 15, restTimeSeconds: 45, order: 6, workoutDayIndex: 1 },
      // Day 2 - Upper + Lower supersets
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Deadlift'], sets: 4, reps: 10, restTimeSeconds: 55, order: 0, workoutDayIndex: 2 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Pull-ups'], sets: 4, reps: 10, restTimeSeconds: 55, order: 1, workoutDayIndex: 2 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Barbell Row'], sets: 4, reps: 12, restTimeSeconds: 50, order: 2, workoutDayIndex: 2 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Dips'], sets: 4, reps: 10, restTimeSeconds: 50, order: 3, workoutDayIndex: 2 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Lat Pulldown'], sets: 4, reps: 12, restTimeSeconds: 50, order: 4, workoutDayIndex: 2 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Leg Curl'], sets: 4, reps: 12, restTimeSeconds: 50, order: 5, workoutDayIndex: 2 },
      // Day 3 - Lower + Upper supersets
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Squat'], sets: 4, reps: 12, restTimeSeconds: 50, order: 0, workoutDayIndex: 3 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Bench Press'], sets: 4, reps: 12, restTimeSeconds: 50, order: 1, workoutDayIndex: 3 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Leg Press'], sets: 4, reps: 12, restTimeSeconds: 50, order: 2, workoutDayIndex: 3 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Overhead Press'], sets: 4, reps: 12, restTimeSeconds: 50, order: 3, workoutDayIndex: 3 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Leg Curl'], sets: 4, reps: 12, restTimeSeconds: 50, order: 4, workoutDayIndex: 3 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Cable Row'], sets: 4, reps: 12, restTimeSeconds: 50, order: 5, workoutDayIndex: 3 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Calf Raise'], sets: 3, reps: 15, restTimeSeconds: 45, order: 6, workoutDayIndex: 3 },
      // Day 4 - Upper + Lower supersets
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Deadlift'], sets: 4, reps: 10, restTimeSeconds: 55, order: 0, workoutDayIndex: 4 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Pull-ups'], sets: 4, reps: 10, restTimeSeconds: 55, order: 1, workoutDayIndex: 4 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Barbell Row'], sets: 4, reps: 12, restTimeSeconds: 50, order: 2, workoutDayIndex: 4 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Dips'], sets: 4, reps: 10, restTimeSeconds: 50, order: 3, workoutDayIndex: 4 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Lat Pulldown'], sets: 4, reps: 12, restTimeSeconds: 50, order: 4, workoutDayIndex: 4 },
      { templateId: gbc12Week.id, exerciseId: exerciseMap['Leg Curl'], sets: 4, reps: 12, restTimeSeconds: 50, order: 5, workoutDayIndex: 4 },
    ],
  })

  // GBC 8-Week Fat Loss (3 days/week, higher rep focus)
  const gbc8Week = await prisma.programTemplate.upsert({
    where: { id: 'template-gbc-8week' },
    update: {},
    create: {
      id: 'template-gbc-8week',
      name: 'GBC 8-Week Fat Loss',
      description: 'GBC method optimized for fat loss: 3 days/week, 12-15 reps, short rest. Time-efficient workouts under 45 min.',
      duration: 8,
      category: 'GBC',
      injuryType: null,
      isActive: true,
    },
  })

  await prisma.programTemplateExercise.deleteMany({ where: { templateId: gbc8Week.id } })
  await prisma.programTemplateExercise.createMany({
    data: [
      // Day 1
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Squat'], sets: 4, reps: 15, restTimeSeconds: 45, order: 0, workoutDayIndex: 1 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Bench Press'], sets: 4, reps: 15, restTimeSeconds: 45, order: 1, workoutDayIndex: 1 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Deadlift'], sets: 3, reps: 12, restTimeSeconds: 50, order: 2, workoutDayIndex: 1 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Lat Pulldown'], sets: 4, reps: 15, restTimeSeconds: 45, order: 3, workoutDayIndex: 1 },
      // Day 2
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Leg Press'], sets: 4, reps: 15, restTimeSeconds: 45, order: 0, workoutDayIndex: 2 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Overhead Press'], sets: 4, reps: 12, restTimeSeconds: 45, order: 1, workoutDayIndex: 2 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Barbell Row'], sets: 4, reps: 12, restTimeSeconds: 45, order: 2, workoutDayIndex: 2 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Calf Raise'], sets: 3, reps: 18, restTimeSeconds: 40, order: 3, workoutDayIndex: 2 },
      // Day 3
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Squat'], sets: 4, reps: 15, restTimeSeconds: 45, order: 0, workoutDayIndex: 3 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Bench Press'], sets: 4, reps: 15, restTimeSeconds: 45, order: 1, workoutDayIndex: 3 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Deadlift'], sets: 3, reps: 12, restTimeSeconds: 50, order: 2, workoutDayIndex: 3 },
      { templateId: gbc8Week.id, exerciseId: exerciseMap['Lat Pulldown'], sets: 4, reps: 15, restTimeSeconds: 45, order: 3, workoutDayIndex: 3 },
    ],
  })

  // Rotator Cuff Rehab (6-8 weeks)
  const rotatorCuff = await prisma.programTemplate.upsert({
    where: { id: 'template-rehab-rotator' },
    update: {},
    create: {
      id: 'template-rehab-rotator',
      name: 'Rotator Cuff Rehab',
      description: 'Shoulder stability and rotator cuff strengthening. Band work, wall push-ups, prone Y/T. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'Rotator Cuff',
      isActive: true,
    },
  })

  await prisma.programTemplateExercise.deleteMany({ where: { templateId: rotatorCuff.id } })
  await prisma.programTemplateExercise.createMany({
    data: [
      { templateId: rotatorCuff.id, exerciseId: exerciseMap['Band External Rotation'], sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { templateId: rotatorCuff.id, exerciseId: exerciseMap['Wall Push-up'], sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { templateId: rotatorCuff.id, exerciseId: exerciseMap['Prone Y/T'], sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
    ],
  })

  // ACL Rehab (Post-op) - phased, 12-16 weeks
  const aclRehab = await prisma.programTemplate.upsert({
    where: { id: 'template-rehab-acl' },
    update: {},
    create: {
      id: 'template-rehab-acl',
      name: 'ACL Rehab (Post-op)',
      description: 'Phased rehabilitation: ROM, strengthening, proprioception. Leg raises, mini-squats, lunges, step-downs. Consult healthcare provider.',
      duration: 14,
      category: 'REHAB',
      injuryType: 'ACL',
      isActive: true,
    },
  })

  await prisma.programTemplateExercise.deleteMany({ where: { templateId: aclRehab.id } })
  await prisma.programTemplateExercise.createMany({
    data: [
      { templateId: aclRehab.id, exerciseId: exerciseMap['Quad Set'], sets: 3, reps: 15, restTimeSeconds: 90, order: 0 },
      { templateId: aclRehab.id, exerciseId: exerciseMap['Straight Leg Raise'], sets: 3, reps: 12, restTimeSeconds: 90, order: 1 },
      { templateId: aclRehab.id, exerciseId: exerciseMap['Mini Squat'], sets: 3, reps: 12, restTimeSeconds: 90, order: 2 },
      { templateId: aclRehab.id, exerciseId: exerciseMap['Hip Bridge'], sets: 3, reps: 12, restTimeSeconds: 90, order: 3 },
      { templateId: aclRehab.id, exerciseId: exerciseMap['Step-down'], sets: 3, reps: 10, restTimeSeconds: 90, order: 4 },
      { templateId: aclRehab.id, exerciseId: exerciseMap['Lunge'], sets: 3, reps: 10, restTimeSeconds: 90, order: 5 },
    ],
  })

  // Lower Back Rehab (4-6 weeks)
  const lowerBack = await prisma.programTemplate.upsert({
    where: { id: 'template-rehab-lowerback' },
    update: {},
    create: {
      id: 'template-rehab-lowerback',
      name: 'Lower Back Rehab',
      description: 'Core stability and lumbar support. Cat-cow, bird dog, bridges, dead bug. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: 'Lower Back',
      isActive: true,
    },
  })

  await prisma.programTemplateExercise.deleteMany({ where: { templateId: lowerBack.id } })
  await prisma.programTemplateExercise.createMany({
    data: [
      { templateId: lowerBack.id, exerciseId: exerciseMap['Cat-Cow'], sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { templateId: lowerBack.id, exerciseId: exerciseMap['Bird Dog'], sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { templateId: lowerBack.id, exerciseId: exerciseMap['Hip Bridge'], sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { templateId: lowerBack.id, exerciseId: exerciseMap['Dead Bug'], sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
    ],
  })

  // Knee (General) Rehab (4-6 weeks)
  const kneeRehab = await prisma.programTemplate.upsert({
    where: { id: 'template-rehab-knee' },
    update: {},
    create: {
      id: 'template-rehab-knee',
      name: 'Knee (General) Rehab',
      description: 'Quad strength, knee control, step-downs. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: 'Knee',
      isActive: true,
    },
  })

  await prisma.programTemplateExercise.deleteMany({ where: { templateId: kneeRehab.id } })
  await prisma.programTemplateExercise.createMany({
    data: [
      { templateId: kneeRehab.id, exerciseId: exerciseMap['Quad Set'], sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { templateId: kneeRehab.id, exerciseId: exerciseMap['Straight Leg Raise'], sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { templateId: kneeRehab.id, exerciseId: exerciseMap['Mini Squat'], sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { templateId: kneeRehab.id, exerciseId: exerciseMap['Clam Shell'], sets: 3, reps: 15, restTimeSeconds: 60, order: 3 },
      { templateId: kneeRehab.id, exerciseId: exerciseMap['Step-down'], sets: 3, reps: 10, restTimeSeconds: 60, order: 4 },
    ],
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
