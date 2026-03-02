import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
}

export async function compressImage(file: File): Promise<File> {
  if (file.size <= COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024) {
    return file
  }
  return imageCompression(file, COMPRESSION_OPTIONS)
}
