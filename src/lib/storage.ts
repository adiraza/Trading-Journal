import { supabase } from './supabase'

const BUCKET_NAME = 'trade-screenshots'

export async function uploadScreenshot(
  file: File,
  tradeId: string,
  type: 'before_entry' | 'after_exit'
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${tradeId}/${type}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteScreenshot(url: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Extract file path from URL
  const urlParts = url.split('/')
  const fileName = urlParts[urlParts.length - 1]
  const filePath = `${user.id}/${fileName}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) throw error
}

export async function uploadBase64Screenshot(
  base64Data: string,
  tradeId: string,
  type: 'before_entry' | 'after_exit',
  fileName: string
): Promise<string> {
  // Convert base64 to blob
  const base64WithoutPrefix = base64Data.split(',')[1] || base64Data
  const byteCharacters = atob(base64WithoutPrefix)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'image/png' })
  const file = new File([blob], fileName, { type: 'image/png' })

  return uploadScreenshot(file, tradeId, type)
}
