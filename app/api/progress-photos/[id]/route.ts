import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabase, PROGRESS_PHOTOS_BUCKET, getPhotoStoragePath } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const photo = await prisma.progressPhoto.findUnique({
      where: { id },
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    if (photo.traineeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const dateStr = photo.date.toISOString().split('T')[0]
    const storagePath = getPhotoStoragePath(photo.traineeId, dateStr, photo.pose)

    await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .remove([storagePath])

    await prisma.progressPhoto.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting progress photo:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
