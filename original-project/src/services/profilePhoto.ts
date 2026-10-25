const ACCOUNT_ID_KEY = 'finance-control-account-id'
const PHOTO_KEY_PREFIX = 'finance-control-profile-photo:'
const PHOTO_UPDATED_EVENT = 'finance-control-profile-photo-updated'

export function setCurrentAccountId(accountId: number | null) {
  if (accountId === null) {
    localStorage.removeItem(ACCOUNT_ID_KEY)
  } else {
    localStorage.setItem(ACCOUNT_ID_KEY, String(accountId))
  }
  window.dispatchEvent(new Event(PHOTO_UPDATED_EVENT))
}

export function getCurrentProfilePhoto() {
  const accountId = localStorage.getItem(ACCOUNT_ID_KEY)
  return accountId ? localStorage.getItem(`${PHOTO_KEY_PREFIX}${accountId}`) : null
}

export function getProfilePhoto(accountId: number) {
  return localStorage.getItem(`${PHOTO_KEY_PREFIX}${accountId}`)
}

export function saveProfilePhoto(accountId: number, dataUrl: string) {
  localStorage.setItem(`${PHOTO_KEY_PREFIX}${accountId}`, dataUrl)
  setCurrentAccountId(accountId)
}

export function removeProfilePhoto(accountId: number) {
  localStorage.removeItem(`${PHOTO_KEY_PREFIX}${accountId}`)
  window.dispatchEvent(new Event(PHOTO_UPDATED_EVENT))
}

export function subscribeToProfilePhoto(listener: () => void) {
  window.addEventListener(PHOTO_UPDATED_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(PHOTO_UPDATED_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export async function prepararFotoPerfil(file: File): Promise<string> {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
  if (!tiposPermitidos.includes(file.type)) {
    throw new Error('Escolha uma imagem JPG, PNG ou WebP.')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('A imagem deve ter no máximo 8 MB.')
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Não foi possível abrir esta imagem.')
  }

  try {
    if (bitmap.width > 12_000 || bitmap.height > 12_000) {
      throw new Error('A resolução da imagem é muito alta. Escolha uma imagem menor.')
    }

    const maxDimension = 512
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Não foi possível processar a imagem.')

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error('Não foi possível processar a imagem.')),
        'image/jpeg',
        0.82,
      )
    })

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Não foi possível carregar a imagem.'))
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Não foi possível carregar a imagem.'))
          return
        }
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  } finally {
    bitmap.close()
  }
}
