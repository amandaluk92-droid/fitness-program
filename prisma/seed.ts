import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ─── EXERCISES ──────────────────────────────────────────────────────────────
  const exercises = [
    // Base / Compound
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
    // GBC new
    { name: 'Front Foot Elevated Split Squat', description: 'Unilateral leg exercise with front foot elevated', muscleGroup: 'Legs' },
    { name: 'Dumbbell Lunge', description: 'Unilateral lower body exercise with dumbbells', muscleGroup: 'Legs' },
    { name: 'Seated Cable Row', description: 'Seated rowing movement for back thickness', muscleGroup: 'Back' },
    { name: 'Incline Dumbbell Press', description: 'Upper chest pressing exercise on incline', muscleGroup: 'Chest' },
    { name: 'Goblet Squat', description: 'Front-loaded squat holding a dumbbell or kettlebell', muscleGroup: 'Legs' },
    // Rehab existing
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
    // Rehab new
    { name: 'Ankle Alphabet', description: 'Ankle mobility tracing letters with foot', muscleGroup: 'Ankles' },
    { name: 'Towel Curl (Foot)', description: 'Toe curling on towel for foot intrinsic strength', muscleGroup: 'Ankles' },
    { name: 'Calf Raise (Single Leg)', description: 'Single-leg calf raise for strength and balance', muscleGroup: 'Calves' },
    { name: 'Eccentric Heel Drop', description: 'Slow lowering of heel off step edge for Achilles rehab', muscleGroup: 'Calves' },
    { name: 'Adductor Squeeze', description: 'Isometric adductor strengthening with ball between knees', muscleGroup: 'Hips' },
    { name: 'Side-Lying Hip Adduction', description: 'Bottom leg lift for inner thigh and adductor strength', muscleGroup: 'Hips' },
    { name: 'Hamstring Curl (Prone)', description: 'Prone hamstring curl for isolated hamstring strengthening', muscleGroup: 'Legs' },
    { name: 'Nordic Hamstring Curl', description: 'Eccentric hamstring exercise for injury prevention', muscleGroup: 'Legs' },
    { name: 'Foam Roll IT Band', description: 'Self-myofascial release for IT band', muscleGroup: 'Legs' },
    { name: 'Side-Lying Leg Raise', description: 'Hip abductor strengthening lying on side', muscleGroup: 'Hips' },
    { name: 'Terminal Knee Extension', description: 'Band-assisted knee extension for VMO activation', muscleGroup: 'Legs' },
    { name: 'Eccentric Squat (Decline)', description: 'Slow squat on decline board for patellar tendon rehab', muscleGroup: 'Legs' },
    { name: 'Plantar Fascia Roll', description: 'Rolling foot on ball for plantar fascia release', muscleGroup: 'Feet' },
    { name: 'Towel Stretch (Calf)', description: 'Seated calf stretch using a towel', muscleGroup: 'Calves' },
    { name: 'Wrist Extensor Stretch', description: 'Forearm extensor stretch for tennis elbow', muscleGroup: 'Arms' },
    { name: 'Eccentric Wrist Extension', description: 'Slow lowering of wrist extension for lateral epicondylitis', muscleGroup: 'Arms' },
    { name: 'Wrist Flexor Stretch', description: 'Forearm flexor stretch for golfer\'s elbow', muscleGroup: 'Arms' },
    { name: 'Eccentric Wrist Curl', description: 'Slow lowering of wrist curl for medial epicondylitis', muscleGroup: 'Arms' },
    { name: 'Scapular Retraction', description: 'Shoulder blade squeeze for posture and scapular control', muscleGroup: 'Shoulders' },
    { name: 'Neck Retraction (Chin Tuck)', description: 'Cervical retraction exercise for neck stability', muscleGroup: 'Neck' },
    { name: 'Neck Side Bend Stretch', description: 'Lateral neck stretch for tension relief', muscleGroup: 'Neck' },
    { name: 'Shoulder Pendulum', description: 'Passive shoulder mobility exercise using gravity', muscleGroup: 'Shoulders' },
    // Rehab new (HEP2go gap analysis)
    // Upper Body
    { name: 'Sleeper Stretch', description: 'Side-lying internal rotation stretch for posterior shoulder tightness', muscleGroup: 'Shoulders' },
    { name: 'Cross-Body Shoulder Stretch', description: 'Horizontal adduction stretch for posterior capsule mobility', muscleGroup: 'Shoulders' },
    { name: 'Doorway Pec Stretch', description: 'Chest stretch using a doorframe for pectoral and anterior shoulder flexibility', muscleGroup: 'Chest' },
    { name: 'Isometric Shoulder External Rotation', description: 'Static hold against wall or doorframe for early-stage rotator cuff activation', muscleGroup: 'Shoulders' },
    { name: 'Median Nerve Glide', description: 'Sequential hand and wrist positions to mobilize the median nerve for carpal tunnel relief', muscleGroup: 'Arms' },
    // Spine / Core
    { name: 'McKenzie Press-Up', description: 'Prone press-up for lumbar extension and disc centralization', muscleGroup: 'Core' },
    { name: 'Knee-to-Chest Stretch', description: 'Supine single or double knee pull for lumbar flexion and lower back relief', muscleGroup: 'Core' },
    { name: 'Piriformis Stretch', description: 'Figure-four or cross-leg stretch targeting the piriformis and deep hip rotators', muscleGroup: 'Hips' },
    { name: 'Sciatic Nerve Glide', description: 'Seated nerve flossing technique to mobilize the sciatic nerve', muscleGroup: 'Legs' },
    { name: 'Thoracic Extension (Foam Roller)', description: 'Upper back extension over a foam roller for thoracic spine mobility', muscleGroup: 'Core' },
    { name: 'Levator Scapulae Stretch', description: 'Angled neck stretch targeting the levator scapulae muscle for neck and shoulder tension', muscleGroup: 'Neck' },
    // Lower Body
    { name: 'Single-Leg Balance', description: 'Standing single-leg balance hold for proprioception and ankle stability', muscleGroup: 'Legs' },
    { name: 'Tibialis Anterior Raise', description: 'Toe raises against resistance for shin splint prevention and tibialis anterior strengthening', muscleGroup: 'Legs' },
    { name: 'Wall Sit', description: 'Isometric wall squat hold for quadriceps endurance and knee stability', muscleGroup: 'Legs' },
    { name: 'Lateral Band Walk', description: 'Side-stepping with resistance band for hip abductor and glute medius activation', muscleGroup: 'Hips' },
    { name: 'Standing Hip Flexor Stretch', description: 'Half-kneeling or standing lunge stretch for hip flexor and psoas flexibility', muscleGroup: 'Hips' },
    { name: 'Pigeon Stretch', description: 'Deep hip external rotation stretch for piriformis and hip capsule mobility', muscleGroup: 'Hips' },
    // Hand / Wrist
    { name: 'Tendon Glide (Hand)', description: 'Sequential finger positions to mobilize flexor tendons for carpal tunnel and hand stiffness', muscleGroup: 'Arms' },
    { name: 'Wrist Pronation/Supination', description: 'Forearm rotation exercise with light weight for elbow and wrist rehab', muscleGroup: 'Arms' },
    { name: 'Grip Strengthening (Towel Squeeze)', description: 'Squeezing a rolled towel for grip and forearm strength rehabilitation', muscleGroup: 'Arms' },
    // Powerlifting new
    { name: 'Front Squat', description: 'Front-loaded barbell squat for quad emphasis', muscleGroup: 'Legs' },
    { name: 'Pause Squat', description: 'Squat with pause at bottom for strength out of the hole', muscleGroup: 'Legs' },
    { name: 'Romanian Deadlift', description: 'Hip-hinge deadlift variation for hamstrings and glutes', muscleGroup: 'Legs' },
    { name: 'Sumo Deadlift', description: 'Wide-stance deadlift variation', muscleGroup: 'Legs' },
    { name: 'Close-Grip Bench Press', description: 'Narrow grip bench press for triceps emphasis', muscleGroup: 'Chest' },
    { name: 'Incline Bench Press', description: 'Barbell bench press on incline for upper chest', muscleGroup: 'Chest' },
    { name: 'Barbell Hip Thrust', description: 'Barbell glute bridge for glute development', muscleGroup: 'Legs' },
    { name: 'Face Pull', description: 'Cable face pull for rear delts and rotator cuff health', muscleGroup: 'Shoulders' },
    { name: 'Pendlay Row', description: 'Strict barbell row from the floor each rep', muscleGroup: 'Back' },
    { name: 'Good Morning', description: 'Barbell hip hinge for posterior chain strength', muscleGroup: 'Back' },
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

  // ─── HELPER ─────────────────────────────────────────────────────────────────
  type TemplateExData = {
    exerciseId: string
    sets: number
    reps: number
    restTimeSeconds?: number
    order: number
    workoutDayIndex?: number
    tempo?: string
    supersetGroup?: string
  }

  async function seedTemplate(
    id: string,
    data: {
      name: string
      description: string
      duration: number
      category: 'GBC' | 'REHAB' | 'POWERLIFTING'
      injuryType?: string
    },
    exerciseData: TemplateExData[]
  ) {
    const template = await prisma.programTemplate.upsert({
      where: { id },
      update: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        category: data.category,
        injuryType: data.injuryType ?? null,
      },
      create: {
        id,
        name: data.name,
        description: data.description,
        duration: data.duration,
        category: data.category,
        injuryType: data.injuryType ?? null,
        isActive: true,
      },
    })

    await prisma.programTemplateExercise.deleteMany({ where: { templateId: template.id } })
    await prisma.programTemplateExercise.createMany({
      data: exerciseData.map((ex) => ({
        templateId: template.id,
        ...ex,
      })),
    })
  }

  const e = (name: string) => exerciseMap[name]

  // ─── GBC TEMPLATES ─────────────────────────────────────────────────────────

  // GBC 12-Week Body Recomposition (improved with tempo + supersets)
  await seedTemplate(
    'template-gbc-12week',
    {
      name: 'GBC 12-Week Body Recomposition',
      description: 'German Body Composition method: compound supersets with controlled tempo, alternating upper/lower. 4 days/week. Phases: Weeks 1-4 Accumulation (12-15 reps, 45s rest), Weeks 5-8 Intensification (8-10 reps, 60s rest), Weeks 9-12 Accumulation (10-12 reps, 50s rest).',
      duration: 12,
      category: 'GBC',
    },
    [
      // Day 1 - Lower + Upper supersets
      { exerciseId: e('Squat'), sets: 4, reps: 12, restTimeSeconds: 10, order: 0, workoutDayIndex: 1, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Bench Press'), sets: 4, reps: 12, restTimeSeconds: 45, order: 1, workoutDayIndex: 1, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Leg Press'), sets: 4, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 1, tempo: '3010', supersetGroup: 'B' },
      { exerciseId: e('Overhead Press'), sets: 4, reps: 12, restTimeSeconds: 45, order: 3, workoutDayIndex: 1, tempo: '3110', supersetGroup: 'B' },
      { exerciseId: e('Leg Curl'), sets: 4, reps: 12, restTimeSeconds: 10, order: 4, workoutDayIndex: 1, tempo: '3110', supersetGroup: 'C' },
      { exerciseId: e('Cable Row'), sets: 4, reps: 12, restTimeSeconds: 45, order: 5, workoutDayIndex: 1, tempo: '3110', supersetGroup: 'C' },
      { exerciseId: e('Calf Raise'), sets: 3, reps: 15, restTimeSeconds: 45, order: 6, workoutDayIndex: 1, tempo: '2110' },
      // Day 2 - Upper + Lower supersets
      { exerciseId: e('Deadlift'), sets: 4, reps: 10, restTimeSeconds: 10, order: 0, workoutDayIndex: 2, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Pull-ups'), sets: 4, reps: 10, restTimeSeconds: 50, order: 1, workoutDayIndex: 2, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Front Foot Elevated Split Squat'), sets: 4, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 2, tempo: '3010', supersetGroup: 'B' },
      { exerciseId: e('Dips'), sets: 4, reps: 10, restTimeSeconds: 50, order: 3, workoutDayIndex: 2, tempo: '3010', supersetGroup: 'B' },
      { exerciseId: e('Lat Pulldown'), sets: 4, reps: 12, restTimeSeconds: 10, order: 4, workoutDayIndex: 2, tempo: '3110', supersetGroup: 'C' },
      { exerciseId: e('Leg Curl'), sets: 4, reps: 12, restTimeSeconds: 50, order: 5, workoutDayIndex: 2, tempo: '3110', supersetGroup: 'C' },
      // Day 3 - Lower + Upper supersets
      { exerciseId: e('Squat'), sets: 4, reps: 12, restTimeSeconds: 10, order: 0, workoutDayIndex: 3, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Incline Dumbbell Press'), sets: 4, reps: 12, restTimeSeconds: 45, order: 1, workoutDayIndex: 3, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Dumbbell Lunge'), sets: 4, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 3, tempo: '3010', supersetGroup: 'B' },
      { exerciseId: e('Seated Cable Row'), sets: 4, reps: 12, restTimeSeconds: 45, order: 3, workoutDayIndex: 3, tempo: '3110', supersetGroup: 'B' },
      { exerciseId: e('Leg Curl'), sets: 4, reps: 12, restTimeSeconds: 10, order: 4, workoutDayIndex: 3, tempo: '3110', supersetGroup: 'C' },
      { exerciseId: e('Cable Row'), sets: 4, reps: 12, restTimeSeconds: 45, order: 5, workoutDayIndex: 3, tempo: '3110', supersetGroup: 'C' },
      { exerciseId: e('Calf Raise'), sets: 3, reps: 15, restTimeSeconds: 45, order: 6, workoutDayIndex: 3, tempo: '2110' },
      // Day 4 - Upper + Lower supersets
      { exerciseId: e('Deadlift'), sets: 4, reps: 10, restTimeSeconds: 10, order: 0, workoutDayIndex: 4, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Chin-up'), sets: 4, reps: 10, restTimeSeconds: 50, order: 1, workoutDayIndex: 4, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Goblet Squat'), sets: 4, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 4, tempo: '3010', supersetGroup: 'B' },
      { exerciseId: e('Overhead Press'), sets: 4, reps: 12, restTimeSeconds: 50, order: 3, workoutDayIndex: 4, tempo: '3110', supersetGroup: 'B' },
      { exerciseId: e('Lat Pulldown'), sets: 4, reps: 12, restTimeSeconds: 10, order: 4, workoutDayIndex: 4, tempo: '3110', supersetGroup: 'C' },
      { exerciseId: e('Leg Curl'), sets: 4, reps: 12, restTimeSeconds: 50, order: 5, workoutDayIndex: 4, tempo: '3110', supersetGroup: 'C' },
    ]
  )

  // GBC 8-Week Fat Loss (improved with tempo + supersets)
  await seedTemplate(
    'template-gbc-8week',
    {
      name: 'GBC 8-Week Fat Loss',
      description: 'GBC method optimized for fat loss: 3 days/week, 12-15 reps, short rest with controlled tempo. Time-efficient workouts under 45 min. Superset paired for maximum metabolic effect.',
      duration: 8,
      category: 'GBC',
    },
    [
      // Day 1
      { exerciseId: e('Squat'), sets: 4, reps: 15, restTimeSeconds: 10, order: 0, workoutDayIndex: 1, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Bench Press'), sets: 4, reps: 15, restTimeSeconds: 45, order: 1, workoutDayIndex: 1, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Deadlift'), sets: 3, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 1, tempo: '3010', supersetGroup: 'B' },
      { exerciseId: e('Lat Pulldown'), sets: 4, reps: 15, restTimeSeconds: 45, order: 3, workoutDayIndex: 1, tempo: '3110', supersetGroup: 'B' },
      // Day 2
      { exerciseId: e('Leg Press'), sets: 4, reps: 15, restTimeSeconds: 10, order: 0, workoutDayIndex: 2, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Overhead Press'), sets: 4, reps: 12, restTimeSeconds: 45, order: 1, workoutDayIndex: 2, tempo: '3110', supersetGroup: 'A' },
      { exerciseId: e('Dumbbell Lunge'), sets: 4, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 2, tempo: '3010', supersetGroup: 'B' },
      { exerciseId: e('Barbell Row'), sets: 4, reps: 12, restTimeSeconds: 45, order: 3, workoutDayIndex: 2, tempo: '3110', supersetGroup: 'B' },
      { exerciseId: e('Calf Raise'), sets: 3, reps: 18, restTimeSeconds: 40, order: 4, workoutDayIndex: 2, tempo: '2110' },
      // Day 3
      { exerciseId: e('Goblet Squat'), sets: 4, reps: 15, restTimeSeconds: 10, order: 0, workoutDayIndex: 3, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Incline Dumbbell Press'), sets: 4, reps: 15, restTimeSeconds: 45, order: 1, workoutDayIndex: 3, tempo: '3010', supersetGroup: 'A' },
      { exerciseId: e('Front Foot Elevated Split Squat'), sets: 3, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 3, tempo: '3010', supersetGroup: 'B' },
      { exerciseId: e('Seated Cable Row'), sets: 4, reps: 15, restTimeSeconds: 45, order: 3, workoutDayIndex: 3, tempo: '3110', supersetGroup: 'B' },
    ]
  )

  // GBC 6-Week Beginner (new)
  await seedTemplate(
    'template-gbc-6week-beginner',
    {
      name: 'GBC 6-Week Beginner',
      description: 'Entry-level GBC: learn superset pacing with simpler tempo. 3 days/week, full body. 12-15 reps, 60s rest between supersets. Master form before advancing.',
      duration: 6,
      category: 'GBC',
    },
    [
      // Day 1
      { exerciseId: e('Goblet Squat'), sets: 3, reps: 15, restTimeSeconds: 10, order: 0, workoutDayIndex: 1, tempo: '2010', supersetGroup: 'A' },
      { exerciseId: e('Bench Press'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1, workoutDayIndex: 1, tempo: '2010', supersetGroup: 'A' },
      { exerciseId: e('Dumbbell Lunge'), sets: 3, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 1, tempo: '2010', supersetGroup: 'B' },
      { exerciseId: e('Lat Pulldown'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3, workoutDayIndex: 1, tempo: '2010', supersetGroup: 'B' },
      { exerciseId: e('Leg Curl'), sets: 3, reps: 15, restTimeSeconds: 10, order: 4, workoutDayIndex: 1, tempo: '2010', supersetGroup: 'C' },
      { exerciseId: e('Overhead Press'), sets: 3, reps: 12, restTimeSeconds: 60, order: 5, workoutDayIndex: 1, tempo: '2010', supersetGroup: 'C' },
      // Day 2
      { exerciseId: e('Leg Press'), sets: 3, reps: 15, restTimeSeconds: 10, order: 0, workoutDayIndex: 2, tempo: '2010', supersetGroup: 'A' },
      { exerciseId: e('Cable Row'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1, workoutDayIndex: 2, tempo: '2010', supersetGroup: 'A' },
      { exerciseId: e('Front Foot Elevated Split Squat'), sets: 3, reps: 12, restTimeSeconds: 10, order: 2, workoutDayIndex: 2, tempo: '2010', supersetGroup: 'B' },
      { exerciseId: e('Incline Dumbbell Press'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3, workoutDayIndex: 2, tempo: '2010', supersetGroup: 'B' },
      { exerciseId: e('Calf Raise'), sets: 3, reps: 15, restTimeSeconds: 10, order: 4, workoutDayIndex: 2, tempo: '2010', supersetGroup: 'C' },
      { exerciseId: e('Bicep Curls'), sets: 3, reps: 12, restTimeSeconds: 60, order: 5, workoutDayIndex: 2, tempo: '2010', supersetGroup: 'C' },
      // Day 3
      { exerciseId: e('Squat'), sets: 3, reps: 12, restTimeSeconds: 10, order: 0, workoutDayIndex: 3, tempo: '2010', supersetGroup: 'A' },
      { exerciseId: e('Seated Cable Row'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1, workoutDayIndex: 3, tempo: '2010', supersetGroup: 'A' },
      { exerciseId: e('Goblet Squat'), sets: 3, reps: 15, restTimeSeconds: 10, order: 2, workoutDayIndex: 3, tempo: '2010', supersetGroup: 'B' },
      { exerciseId: e('Dips'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3, workoutDayIndex: 3, tempo: '2010', supersetGroup: 'B' },
      { exerciseId: e('Leg Curl'), sets: 3, reps: 15, restTimeSeconds: 10, order: 4, workoutDayIndex: 3, tempo: '2010', supersetGroup: 'C' },
      { exerciseId: e('Chin-up'), sets: 3, reps: 12, restTimeSeconds: 60, order: 5, workoutDayIndex: 3, tempo: '2010', supersetGroup: 'C' },
    ]
  )

  // ─── REHAB TEMPLATES ───────────────────────────────────────────────────────

  // Rotator Cuff Rehab (improved - added 2 more exercises)
  await seedTemplate(
    'template-rehab-rotator',
    {
      name: 'Rotator Cuff Rehab',
      description: 'Shoulder stability and rotator cuff strengthening. Band work, wall push-ups, pendulum, prone Y/T, scapular retraction. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'Rotator Cuff',
    },
    [
      { exerciseId: e('Shoulder Pendulum'), sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Band External Rotation'), sets: 3, reps: 15, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Wall Push-up'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Prone Y/T'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Scapular Retraction'), sets: 3, reps: 15, restTimeSeconds: 60, order: 4 },
    ]
  )

  // ACL Rehab (Post-op) - enhanced with proprioception and isometric work
  await seedTemplate(
    'template-rehab-acl',
    {
      name: 'ACL Rehab (Post-op)',
      description: 'Phased rehabilitation: ROM, strengthening, proprioception. Leg raises, mini-squats, lunges, step-downs, single-leg balance, wall sit. Consult healthcare provider.',
      duration: 14,
      category: 'REHAB',
      injuryType: 'ACL',
    },
    [
      { exerciseId: e('Quad Set'), sets: 3, reps: 15, restTimeSeconds: 90, order: 0 },
      { exerciseId: e('Straight Leg Raise'), sets: 3, reps: 12, restTimeSeconds: 90, order: 1 },
      { exerciseId: e('Mini Squat'), sets: 3, reps: 12, restTimeSeconds: 90, order: 2 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 90, order: 3 },
      { exerciseId: e('Step-down'), sets: 3, reps: 10, restTimeSeconds: 90, order: 4 },
      { exerciseId: e('Lunge'), sets: 3, reps: 10, restTimeSeconds: 90, order: 5 },
      { exerciseId: e('Single-Leg Balance'), sets: 3, reps: 10, restTimeSeconds: 60, order: 6 },
      { exerciseId: e('Wall Sit'), sets: 3, reps: 10, restTimeSeconds: 90, order: 7 },
    ]
  )

  // Lower Back Rehab - enhanced with piriformis stretch and knee-to-chest
  await seedTemplate(
    'template-rehab-lowerback',
    {
      name: 'Lower Back Rehab',
      description: 'Core stability and lumbar support. Cat-cow, bird dog, bridges, dead bug, piriformis stretch, knee-to-chest. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: 'Lower Back',
    },
    [
      { exerciseId: e('Cat-Cow'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Bird Dog'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Dead Bug'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Piriformis Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 4 },
      { exerciseId: e('Knee-to-Chest Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 5 },
    ]
  )

  // Knee (General) Rehab - kept as-is
  await seedTemplate(
    'template-rehab-knee',
    {
      name: 'Knee (General) Rehab',
      description: 'Quad strength, knee control, step-downs. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: 'Knee',
    },
    [
      { exerciseId: e('Quad Set'), sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Straight Leg Raise'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Mini Squat'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Clam Shell'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Step-down'), sets: 3, reps: 10, restTimeSeconds: 60, order: 4 },
    ]
  )

  // ─── NEW REHAB TEMPLATES ───────────────────────────────────────────────────

  // Ankle Rehab - enhanced with proprioception
  await seedTemplate(
    'template-rehab-ankle',
    {
      name: 'Ankle Rehab',
      description: 'Ankle mobility and strength restoration. Alphabet exercises, towel curls, single-leg calf raises, mini squats, single-leg balance. Consult healthcare provider before starting.',
      duration: 4,
      category: 'REHAB',
      injuryType: 'Ankle',
    },
    [
      { exerciseId: e('Ankle Alphabet'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Towel Curl (Foot)'), sets: 3, reps: 15, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Calf Raise (Single Leg)'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Mini Squat'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Single-Leg Balance'), sets: 3, reps: 10, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Achilles Tendinopathy Rehab
  await seedTemplate(
    'template-rehab-achilles',
    {
      name: 'Achilles Tendinopathy Rehab',
      description: 'Eccentric-focused Achilles rehab. Heel drops, calf raises, stretches, bridges. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'Achilles',
    },
    [
      { exerciseId: e('Eccentric Heel Drop'), sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Calf Raise (Single Leg)'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Towel Stretch (Calf)'), sets: 3, reps: 10, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
    ]
  )

  // Groin/Hip Adductor Rehab
  await seedTemplate(
    'template-rehab-groin',
    {
      name: 'Groin/Hip Adductor Rehab',
      description: 'Adductor strengthening and hip stability. Squeezes, side-lying adduction, clam shells, bridges, lunges. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: 'Groin/Hip',
    },
    [
      { exerciseId: e('Adductor Squeeze'), sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Side-Lying Hip Adduction'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Clam Shell'), sets: 3, reps: 15, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Lunge'), sets: 3, reps: 10, restTimeSeconds: 90, order: 4 },
    ]
  )

  // Hamstring Rehab
  await seedTemplate(
    'template-rehab-hamstring',
    {
      name: 'Hamstring Rehab',
      description: 'Progressive hamstring rehabilitation. Prone curls, Nordic curls, bridges, dead bugs. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'Hamstring',
    },
    [
      { exerciseId: e('Hamstring Curl (Prone)'), sets: 3, reps: 12, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Nordic Hamstring Curl'), sets: 3, reps: 10, restTimeSeconds: 90, order: 1 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Dead Bug'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
    ]
  )

  // IT Band Rehab
  await seedTemplate(
    'template-rehab-itband',
    {
      name: 'IT Band Rehab',
      description: 'IT band release and hip strengthening. Foam rolling, leg raises, clam shells, bridges, mini squats. Consult healthcare provider before starting.',
      duration: 4,
      category: 'REHAB',
      injuryType: 'IT Band',
    },
    [
      { exerciseId: e('Foam Roll IT Band'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Side-Lying Leg Raise'), sets: 3, reps: 15, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Clam Shell'), sets: 3, reps: 15, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Mini Squat'), sets: 3, reps: 12, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Patellar Tendinopathy Rehab
  await seedTemplate(
    'template-rehab-patellar',
    {
      name: 'Patellar Tendinopathy Rehab',
      description: 'Eccentric loading for patellar tendon. Terminal knee extension, decline squats, quad sets, leg raises, step-downs. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'Patellar Tendon',
    },
    [
      { exerciseId: e('Terminal Knee Extension'), sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Eccentric Squat (Decline)'), sets: 3, reps: 12, restTimeSeconds: 90, order: 1 },
      { exerciseId: e('Quad Set'), sets: 3, reps: 15, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Straight Leg Raise'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Step-down'), sets: 3, reps: 10, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Plantar Fasciitis Rehab
  await seedTemplate(
    'template-rehab-plantar',
    {
      name: 'Plantar Fasciitis Rehab',
      description: 'Plantar fascia release and calf flexibility. Rolling, towel stretches, calf raises, towel curls. Consult healthcare provider before starting.',
      duration: 4,
      category: 'REHAB',
      injuryType: 'Plantar Fasciitis',
    },
    [
      { exerciseId: e('Plantar Fascia Roll'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Towel Stretch (Calf)'), sets: 3, reps: 10, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Calf Raise (Single Leg)'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Towel Curl (Foot)'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3 },
    ]
  )

  // Tennis Elbow Rehab - enhanced with grip and forearm work
  await seedTemplate(
    'template-rehab-tennis-elbow',
    {
      name: 'Tennis Elbow Rehab',
      description: 'Lateral epicondylitis rehab. Wrist extensor stretches, eccentric wrist extensions, band rotations, grip strengthening, forearm rotation. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: 'Tennis Elbow',
    },
    [
      { exerciseId: e('Wrist Extensor Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Eccentric Wrist Extension'), sets: 3, reps: 15, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Band External Rotation'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Grip Strengthening (Towel Squeeze)'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Wrist Pronation/Supination'), sets: 3, reps: 12, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Golfer's Elbow Rehab - enhanced with grip and forearm work
  await seedTemplate(
    'template-rehab-golfers-elbow',
    {
      name: "Golfer's Elbow Rehab",
      description: 'Medial epicondylitis rehab. Wrist flexor stretches, eccentric wrist curls, band rotations, grip strengthening, forearm rotation. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: "Golfer's Elbow",
    },
    [
      { exerciseId: e('Wrist Flexor Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Eccentric Wrist Curl'), sets: 3, reps: 15, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Band External Rotation'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Grip Strengthening (Towel Squeeze)'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Wrist Pronation/Supination'), sets: 3, reps: 12, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Shoulder ROM Rehab
  await seedTemplate(
    'template-rehab-shoulder-rom',
    {
      name: 'Shoulder ROM Rehab',
      description: 'Frozen shoulder / ROM restoration. Pendulum, wall push-ups, band rotations, prone Y/T, scapular retraction. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'Frozen Shoulder',
    },
    [
      { exerciseId: e('Shoulder Pendulum'), sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Wall Push-up'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Band External Rotation'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Prone Y/T'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Scapular Retraction'), sets: 3, reps: 15, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Neck Strain Rehab
  await seedTemplate(
    'template-rehab-neck',
    {
      name: 'Neck Strain Rehab',
      description: 'Gentle neck mobility and stability. Chin tucks, side bend stretches, scapular retraction. Consult healthcare provider before starting.',
      duration: 3,
      category: 'REHAB',
      injuryType: 'Neck',
    },
    [
      { exerciseId: e('Neck Retraction (Chin Tuck)'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Neck Side Bend Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Scapular Retraction'), sets: 3, reps: 15, restTimeSeconds: 60, order: 2 },
    ]
  )

  // ─── NEW REHAB TEMPLATES (HEP2go Gap Analysis) ─────────────────────────────

  // Sciatica Rehab
  await seedTemplate(
    'template-rehab-sciatica',
    {
      name: 'Sciatica Rehab',
      description: 'Nerve mobilization and lumbar support for sciatic pain. Piriformis stretch, sciatic nerve glide, knee-to-chest, bird dog, McKenzie press-up. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'Sciatica',
    },
    [
      { exerciseId: e('Piriformis Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Sciatic Nerve Glide'), sets: 3, reps: 10, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Knee-to-Chest Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Bird Dog'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('McKenzie Press-Up'), sets: 3, reps: 10, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Hip Bursitis Rehab
  await seedTemplate(
    'template-rehab-hip-bursitis',
    {
      name: 'Hip Bursitis Rehab',
      description: 'Hip abductor strengthening and flexibility for trochanteric bursitis. Clam shells, lateral band walks, pigeon stretch, bridges, hip flexor stretch. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: 'Hip Bursitis',
    },
    [
      { exerciseId: e('Clam Shell'), sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Lateral Band Walk'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Pigeon Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Standing Hip Flexor Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Ankle Sprain Rehab
  await seedTemplate(
    'template-rehab-ankle-sprain',
    {
      name: 'Ankle Sprain Rehab',
      description: 'Proprioception-focused ankle sprain recovery. Ankle alphabet, single-leg balance, calf raises, towel curls, mini squats. Consult healthcare provider before starting.',
      duration: 5,
      category: 'REHAB',
      injuryType: 'Ankle Sprain',
    },
    [
      { exerciseId: e('Ankle Alphabet'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Single-Leg Balance'), sets: 3, reps: 10, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Calf Raise (Single Leg)'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Towel Curl (Foot)'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Mini Squat'), sets: 3, reps: 12, restTimeSeconds: 60, order: 4 },
    ]
  )

  // MCL Injury Rehab
  await seedTemplate(
    'template-rehab-mcl',
    {
      name: 'MCL Injury Rehab',
      description: 'Medial collateral ligament recovery. Quad sets, straight leg raises, mini squats, bridges, wall sit, step-downs. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'MCL',
    },
    [
      { exerciseId: e('Quad Set'), sets: 3, reps: 15, restTimeSeconds: 90, order: 0 },
      { exerciseId: e('Straight Leg Raise'), sets: 3, reps: 12, restTimeSeconds: 90, order: 1 },
      { exerciseId: e('Mini Squat'), sets: 3, reps: 12, restTimeSeconds: 90, order: 2 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 90, order: 3 },
      { exerciseId: e('Wall Sit'), sets: 3, reps: 10, restTimeSeconds: 90, order: 4 },
      { exerciseId: e('Step-down'), sets: 3, reps: 10, restTimeSeconds: 90, order: 5 },
    ]
  )

  // Carpal Tunnel Rehab
  await seedTemplate(
    'template-rehab-carpal-tunnel',
    {
      name: 'Carpal Tunnel Rehab',
      description: 'Nerve and tendon gliding for carpal tunnel syndrome. Median nerve glide, tendon glide, wrist pronation/supination, grip strengthening. Consult healthcare provider before starting.',
      duration: 4,
      category: 'REHAB',
      injuryType: 'Carpal Tunnel',
    },
    [
      { exerciseId: e('Median Nerve Glide'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Tendon Glide (Hand)'), sets: 3, reps: 10, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Wrist Pronation/Supination'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Grip Strengthening (Towel Squeeze)'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3 },
    ]
  )

  // Spinal Stenosis Rehab
  await seedTemplate(
    'template-rehab-spinal-stenosis',
    {
      name: 'Spinal Stenosis Rehab',
      description: 'Flexion-based program for spinal stenosis. Knee-to-chest, cat-cow, dead bug, bridges, hip flexor stretch. Consult healthcare provider before starting.',
      duration: 6,
      category: 'REHAB',
      injuryType: 'Spinal Stenosis',
    },
    [
      { exerciseId: e('Knee-to-Chest Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Cat-Cow'), sets: 3, reps: 10, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Dead Bug'), sets: 3, reps: 12, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Standing Hip Flexor Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Shin Splints Rehab
  await seedTemplate(
    'template-rehab-shin-splints',
    {
      name: 'Shin Splints Rehab',
      description: 'Tibialis anterior strengthening and calf balance for shin splints. Tibialis raises, calf raises, ankle alphabet, wall sit. Consult healthcare provider before starting.',
      duration: 4,
      category: 'REHAB',
      injuryType: 'Shin Splints',
    },
    [
      { exerciseId: e('Tibialis Anterior Raise'), sets: 3, reps: 15, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Calf Raise (Single Leg)'), sets: 3, reps: 12, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Ankle Alphabet'), sets: 3, reps: 10, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Wall Sit'), sets: 3, reps: 10, restTimeSeconds: 60, order: 3 },
    ]
  )

  // Thoracic / Postural Rehab
  await seedTemplate(
    'template-rehab-thoracic-postural',
    {
      name: 'Thoracic/Postural Rehab',
      description: 'Desk worker posture correction. Thoracic extension, doorway pec stretch, scapular retraction, chin tuck, prone Y/T. Consult healthcare provider before starting.',
      duration: 4,
      category: 'REHAB',
      injuryType: 'Postural/Thoracic',
    },
    [
      { exerciseId: e('Thoracic Extension (Foam Roller)'), sets: 3, reps: 10, restTimeSeconds: 60, order: 0 },
      { exerciseId: e('Doorway Pec Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Scapular Retraction'), sets: 3, reps: 15, restTimeSeconds: 60, order: 2 },
      { exerciseId: e('Neck Retraction (Chin Tuck)'), sets: 3, reps: 10, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Prone Y/T'), sets: 3, reps: 12, restTimeSeconds: 60, order: 4 },
    ]
  )

  // Post Hip Replacement Rehab
  await seedTemplate(
    'template-rehab-hip-replacement',
    {
      name: 'Post Hip Replacement Rehab',
      description: 'Structured recovery after total hip replacement. Bridges, clam shells, leg raises, hip flexor stretch, mini squats, single-leg balance. Consult healthcare provider before starting.',
      duration: 8,
      category: 'REHAB',
      injuryType: 'Hip Replacement',
    },
    [
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 90, order: 0 },
      { exerciseId: e('Clam Shell'), sets: 3, reps: 15, restTimeSeconds: 60, order: 1 },
      { exerciseId: e('Straight Leg Raise'), sets: 3, reps: 12, restTimeSeconds: 90, order: 2 },
      { exerciseId: e('Standing Hip Flexor Stretch'), sets: 3, reps: 10, restTimeSeconds: 60, order: 3 },
      { exerciseId: e('Mini Squat'), sets: 3, reps: 12, restTimeSeconds: 90, order: 4 },
      { exerciseId: e('Single-Leg Balance'), sets: 3, reps: 10, restTimeSeconds: 60, order: 5 },
    ]
  )

  // Post Total Knee Replacement Rehab
  await seedTemplate(
    'template-rehab-knee-replacement',
    {
      name: 'Post Total Knee Replacement Rehab',
      description: 'Structured recovery after total knee replacement. Quad sets, leg raises, mini squats, bridges, step-downs, wall sit. Consult healthcare provider before starting.',
      duration: 10,
      category: 'REHAB',
      injuryType: 'Knee Replacement',
    },
    [
      { exerciseId: e('Quad Set'), sets: 3, reps: 15, restTimeSeconds: 90, order: 0 },
      { exerciseId: e('Straight Leg Raise'), sets: 3, reps: 12, restTimeSeconds: 90, order: 1 },
      { exerciseId: e('Mini Squat'), sets: 3, reps: 12, restTimeSeconds: 90, order: 2 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 90, order: 3 },
      { exerciseId: e('Step-down'), sets: 3, reps: 10, restTimeSeconds: 90, order: 4 },
      { exerciseId: e('Wall Sit'), sets: 3, reps: 10, restTimeSeconds: 90, order: 5 },
    ]
  )

  // ─── POWERLIFTING TEMPLATES ────────────────────────────────────────────────

  // Starting Strength (Beginner)
  await seedTemplate(
    'template-pl-starting-strength',
    {
      name: 'Starting Strength (Beginner)',
      description: 'Linear progression for beginners. Add 2.5kg per session. 3x5 core lifts. Based on Starting Strength principles. Alternating A/B days, 3 days/week.',
      duration: 12,
      category: 'POWERLIFTING',
    },
    [
      // Day A
      { exerciseId: e('Squat'), sets: 3, reps: 5, restTimeSeconds: 180, order: 0, workoutDayIndex: 1 },
      { exerciseId: e('Bench Press'), sets: 3, reps: 5, restTimeSeconds: 180, order: 1, workoutDayIndex: 1 },
      { exerciseId: e('Deadlift'), sets: 1, reps: 5, restTimeSeconds: 180, order: 2, workoutDayIndex: 1 },
      // Day B
      { exerciseId: e('Squat'), sets: 3, reps: 5, restTimeSeconds: 180, order: 0, workoutDayIndex: 2 },
      { exerciseId: e('Overhead Press'), sets: 3, reps: 5, restTimeSeconds: 180, order: 1, workoutDayIndex: 2 },
      { exerciseId: e('Barbell Row'), sets: 3, reps: 5, restTimeSeconds: 180, order: 2, workoutDayIndex: 2 },
    ]
  )

  // Wendler 5/3/1 (Intermediate)
  await seedTemplate(
    'template-pl-531',
    {
      name: 'Wendler 5/3/1 (Intermediate)',
      description: "Jim Wendler's 5/3/1: 4-week cycles based on 90% of 1RM. Week 1: 3x5, Week 2: 3x3, Week 3: 5/3/1, Week 4: deload. Add 2.5kg upper / 5kg lower per cycle. 4 days/week.",
      duration: 16,
      category: 'POWERLIFTING',
    },
    [
      // Day 1 - Squat
      { exerciseId: e('Squat'), sets: 3, reps: 5, restTimeSeconds: 180, order: 0, workoutDayIndex: 1 },
      { exerciseId: e('Front Squat'), sets: 3, reps: 8, restTimeSeconds: 120, order: 1, workoutDayIndex: 1 },
      { exerciseId: e('Leg Press'), sets: 3, reps: 10, restTimeSeconds: 90, order: 2, workoutDayIndex: 1 },
      { exerciseId: e('Hip Bridge'), sets: 3, reps: 12, restTimeSeconds: 60, order: 3, workoutDayIndex: 1 },
      // Day 2 - Bench
      { exerciseId: e('Bench Press'), sets: 3, reps: 5, restTimeSeconds: 180, order: 0, workoutDayIndex: 2 },
      { exerciseId: e('Close-Grip Bench Press'), sets: 3, reps: 8, restTimeSeconds: 120, order: 1, workoutDayIndex: 2 },
      { exerciseId: e('Dips'), sets: 3, reps: 10, restTimeSeconds: 90, order: 2, workoutDayIndex: 2 },
      { exerciseId: e('Face Pull'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3, workoutDayIndex: 2 },
      // Day 3 - Deadlift
      { exerciseId: e('Deadlift'), sets: 3, reps: 5, restTimeSeconds: 180, order: 0, workoutDayIndex: 3 },
      { exerciseId: e('Romanian Deadlift'), sets: 3, reps: 8, restTimeSeconds: 120, order: 1, workoutDayIndex: 3 },
      { exerciseId: e('Barbell Row'), sets: 3, reps: 10, restTimeSeconds: 90, order: 2, workoutDayIndex: 3 },
      { exerciseId: e('Good Morning'), sets: 3, reps: 10, restTimeSeconds: 90, order: 3, workoutDayIndex: 3 },
      // Day 4 - OHP
      { exerciseId: e('Overhead Press'), sets: 3, reps: 5, restTimeSeconds: 180, order: 0, workoutDayIndex: 4 },
      { exerciseId: e('Incline Bench Press'), sets: 3, reps: 8, restTimeSeconds: 120, order: 1, workoutDayIndex: 4 },
      { exerciseId: e('Lat Pulldown'), sets: 3, reps: 10, restTimeSeconds: 90, order: 2, workoutDayIndex: 4 },
      { exerciseId: e('Face Pull'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3, workoutDayIndex: 4 },
    ]
  )

  // Powerlifting Peaking (Advanced)
  await seedTemplate(
    'template-pl-peaking',
    {
      name: 'Powerlifting Peaking (Advanced)',
      description: '3-block periodization for competition prep. Weeks 1-4: Volume (4x8-10). Weeks 5-8: Strength (4x5). Weeks 9-12: Peaking (5x3, 3x2, 2x1). For experienced lifters. 4 days/week.',
      duration: 12,
      category: 'POWERLIFTING',
    },
    [
      // Day 1 - Squat Focus
      { exerciseId: e('Squat'), sets: 4, reps: 5, restTimeSeconds: 240, order: 0, workoutDayIndex: 1 },
      { exerciseId: e('Pause Squat'), sets: 3, reps: 3, restTimeSeconds: 180, order: 1, workoutDayIndex: 1 },
      { exerciseId: e('Leg Press'), sets: 3, reps: 8, restTimeSeconds: 120, order: 2, workoutDayIndex: 1 },
      { exerciseId: e('Barbell Hip Thrust'), sets: 3, reps: 10, restTimeSeconds: 90, order: 3, workoutDayIndex: 1 },
      // Day 2 - Bench Focus
      { exerciseId: e('Bench Press'), sets: 4, reps: 5, restTimeSeconds: 240, order: 0, workoutDayIndex: 2 },
      { exerciseId: e('Close-Grip Bench Press'), sets: 3, reps: 6, restTimeSeconds: 180, order: 1, workoutDayIndex: 2 },
      { exerciseId: e('Incline Dumbbell Press'), sets: 3, reps: 8, restTimeSeconds: 120, order: 2, workoutDayIndex: 2 },
      { exerciseId: e('Pendlay Row'), sets: 3, reps: 8, restTimeSeconds: 120, order: 3, workoutDayIndex: 2 },
      // Day 3 - Deadlift Focus
      { exerciseId: e('Deadlift'), sets: 4, reps: 5, restTimeSeconds: 240, order: 0, workoutDayIndex: 3 },
      { exerciseId: e('Sumo Deadlift'), sets: 3, reps: 5, restTimeSeconds: 180, order: 1, workoutDayIndex: 3 },
      { exerciseId: e('Good Morning'), sets: 3, reps: 8, restTimeSeconds: 120, order: 2, workoutDayIndex: 3 },
      { exerciseId: e('Pull-ups'), sets: 3, reps: 8, restTimeSeconds: 120, order: 3, workoutDayIndex: 3 },
      // Day 4 - Upper Accessories
      { exerciseId: e('Overhead Press'), sets: 4, reps: 5, restTimeSeconds: 180, order: 0, workoutDayIndex: 4 },
      { exerciseId: e('Incline Bench Press'), sets: 3, reps: 8, restTimeSeconds: 120, order: 1, workoutDayIndex: 4 },
      { exerciseId: e('Cable Row'), sets: 3, reps: 10, restTimeSeconds: 90, order: 2, workoutDayIndex: 4 },
      { exerciseId: e('Face Pull'), sets: 3, reps: 15, restTimeSeconds: 60, order: 3, workoutDayIndex: 4 },
    ]
  )

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
