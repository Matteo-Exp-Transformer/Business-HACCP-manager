import { supabase } from '../lib/supabase.js'

const DEFAULT_BUCKET = 'labels'

export const uploadLabel = async (file, path, bucket = DEFAULT_BUCKET) => {
  try {
    if (!file || !path) throw new Error('File and path are required')
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
    })
    if (error) throw error
    return { success: true, path: data.path }
  } catch (error) {
    console.error('uploadLabel error:', error)
    return { success: false, error: error.message }
  }
}

export const getSignedLabelUrl = async (path, expiresInSec = 3600, bucket = DEFAULT_BUCKET) => {
  try {
    if (!path) throw new Error('Path is required')
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSec)
    if (error) throw error
    return { success: true, url: data.signedUrl }
  } catch (error) {
    console.error('getSignedLabelUrl error:', error)
    return { success: false, error: error.message }
  }
}

export const removeLabel = async (path, bucket = DEFAULT_BUCKET) => {
  try {
    if (!path) throw new Error('Path is required')
    const { data, error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('removeLabel error:', error)
    return { success: false, error: error.message }
  }
}

