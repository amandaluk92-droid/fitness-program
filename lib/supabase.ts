import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use service role key for server-side operations (signed URLs, private bucket access)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Server-side client with elevated permissions for signed URL generation */
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase

export const PROGRESS_PHOTOS_BUCKET = 'progress-photos'

/** Signed URL expiration in seconds (15 minutes) */
export const SIGNED_URL_EXPIRY_SECONDS = 15 * 60

export function getPhotoStoragePath(traineeId: string, date: string, pose: string): string {
  return `${traineeId}/${date}/${pose.toLowerCase()}.jpg`
}

/**
 * Generate a signed URL for a photo in the private bucket.
 * Falls back to public URL if service role key is not configured.
 */
export async function getSignedPhotoUrl(storagePath: string): Promise<string | null> {
  if (supabaseServiceKey) {
    const { data, error } = await supabaseAdmin.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS)
    if (error || !data?.signedUrl) return null
    return data.signedUrl
  }
  // Fallback: public URL when service role key is not set
  const { data } = supabase.storage.from(PROGRESS_PHOTOS_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}
