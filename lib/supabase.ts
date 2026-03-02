import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const PROGRESS_PHOTOS_BUCKET = 'progress-photos'

export function getPhotoStoragePath(traineeId: string, date: string, pose: string): string {
  return `${traineeId}/${date}/${pose.toLowerCase()}.jpg`
}
