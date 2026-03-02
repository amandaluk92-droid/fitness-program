import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabase, PROGRESS_PHOTOS_BUCKET, getPhotoStoragePath } from '@/lib/supabase'
import { z } from 'zod'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB before compression

const uploadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pose: z.enum(['FRONT', 'SIDE', 'BACK']),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const date = formData.get('date') as string | null
    const pose = formData.get('pose') as string | null
    const notes = formData.get('notes') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or HEIC.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 })
    }

    const validated = uploadSchema.parse({ date, pose, notes })

    const storagePath = getPhotoStoragePath(session.user.id, validated.date, validated.pose)

    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .getPublicUrl(storagePath)

    // Replace existing photo for same trainee+date+pose
    await prisma.progressPhoto.deleteMany({
      where: {
        traineeId: session.user.id,
        date: new Date(validated.date),
        pose: validated.pose,
      },
    })

    const photo = await prisma.progressPhoto.create({
      data: {
        traineeId: session.user.id,
        photoUrl: urlData.publicUrl,
        date: new Date(validated.date),
        pose: validated.pose,
        notes: validated.notes || null,
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error uploading progress photo:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const traineeId = searchParams.get('traineeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let targetTraineeId: string

    if (session.user.role === 'TRAINEE') {
      targetTraineeId = session.user.id
    } else if (session.user.role === 'TRAINER') {
      if (!traineeId) {
        return NextResponse.json({ error: 'traineeId is required for trainers' }, { status: 400 })
      }
      const connection = await prisma.trainerTraineeConnection.findUnique({
        where: {
          trainerId_traineeId: {
            trainerId: session.user.id,
            traineeId,
          },
        },
      })
      if (!connection) {
        return NextResponse.json({ error: 'Not connected to this trainee' }, { status: 403 })
      }
      targetTraineeId = traineeId
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const where: any = { traineeId: targetTraineeId }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const photos = await prisma.progressPhoto.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error fetching progress photos:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}
