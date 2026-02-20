import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage helpers
export const uploadDocument = async (
  file: File,
  activityId: string
): Promise<{ path: string; url: string; error?: string } | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${activityId}/${Date.now()}.${fileExt}`

  console.log('Uploading file:', fileName, 'to bucket: documents')

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file)

  if (error) {
    console.error('Storage upload error:', error.message, error)
    alert(`Upload failed: ${error.message}`)
    return null
  }

  console.log('Upload successful:', data)

  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(data.path)

  console.log('Public URL:', urlData.publicUrl)

  return { path: data.path, url: urlData.publicUrl }
}

export const deleteDocument = async (path: string): Promise<boolean> => {
  const { error } = await supabase.storage.from('documents').remove([path])
  return !error
}
