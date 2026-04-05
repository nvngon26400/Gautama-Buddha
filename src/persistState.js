/**
 * Lưu trạng thái ứng dụng vào localStorage — giữ tối thiểu 365 ngày (browser không tự xóa;
 * có thể đọc lại sau reload / đóng tab). Giới hạn kích thước ảnh để tránh vượt quota.
 */
import { PERSIST_KEY as PERSIST_KEY_SHARED, STORAGE_LOCALE, STORAGE_THEME } from './storageKeys.js'

export const PERSIST_KEY = PERSIST_KEY_SHARED
export const PERSIST_VERSION = 1
/** Mục tiêu: dữ liệu vẫn hợp lệ sau ít nhất 365 ngày — không TTL xóa trước mốc đó. */
export const MIN_RETENTION_DAYS = 365

const MAX_IMAGE_CHARS = 2_400_000

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function readLegacyThemeLocale() {
  let theme
  let locale
  try {
    const ts = localStorage.getItem(STORAGE_THEME)
    if (ts === 'light' || ts === 'dark') theme = ts
  } catch {
    /* ignore */
  }
  try {
    const ls = localStorage.getItem(STORAGE_LOCALE)
    if (ls === 'vi' || ls === 'en') locale = ls
  } catch {
    /* ignore */
  }
  return { theme, locale }
}

/**
 * @returns {{
 *   theme: string,
 *   locale: string,
 *   tab: string,
 *   selectedId: string | null,
 *   scanResult: object | null,
 *   scanError: string | null,
 *   imageDataUrl: string | null,
 *   calendarYmd: string | null,
 * }}
 */
export function loadPersistedState() {
  const defaults = {
    theme: 'light',
    locale: 'vi',
    tab: 'scan',
    selectedId: null,
    scanResult: null,
    scanError: null,
    imageDataUrl: null,
    calendarYmd: null,
  }
  if (typeof window === 'undefined') return { ...defaults }

  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (raw) {
      const j = safeParse(raw)
      if (j && j.v === PERSIST_VERSION) {
        const tab = j.tab === 'library' || j.tab === 'calendar' || j.tab === 'scan' ? j.tab : 'scan'
        return {
          theme: j.theme === 'dark' || j.theme === 'light' ? j.theme : defaults.theme,
          locale: j.locale === 'en' || j.locale === 'vi' ? j.locale : defaults.locale,
          tab,
          selectedId: typeof j.selectedId === 'string' ? j.selectedId : j.selectedId ? String(j.selectedId) : null,
          scanResult: j.scanResult && typeof j.scanResult === 'object' ? j.scanResult : null,
          scanError: typeof j.scanError === 'string' ? j.scanError : null,
          imageDataUrl: typeof j.imageDataUrl === 'string' && j.imageDataUrl.startsWith('data:') ? j.imageDataUrl : null,
          calendarYmd: typeof j.calendarYmd === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(j.calendarYmd) ? j.calendarYmd : null,
        }
      }
    }
  } catch {
    /* ignore */
  }

  const leg = readLegacyThemeLocale()
  return {
    ...defaults,
    ...(leg.theme ? { theme: leg.theme } : {}),
    ...(leg.locale ? { locale: leg.locale } : {}),
  }
}

function ymdFromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseLocalYmd(s) {
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d, 12, 0, 0)
}

/**
 * Ghi toàn bộ snapshot hiện tại (gọi từ App sau debounce).
 * @param {object} p
 * @param {string} p.theme
 * @param {string} p.locale
 * @param {string} p.tab
 * @param {string|null} p.selectedId
 * @param {object|null} p.scanResult
 * @param {string|null} p.scanError
 * @param {string|null} p.imageDataUrl
 * @param {Date} p.calendarAnchor
 */
export function saveFullSnapshot(p) {
  const payload = {
    v: PERSIST_VERSION,
    savedAt: Date.now(),
    theme: p.theme,
    locale: p.locale,
    tab: p.tab,
    selectedId: p.selectedId ?? null,
    scanResult: p.scanResult ?? null,
    scanError: p.scanError ?? null,
    imageDataUrl: typeof p.imageDataUrl === 'string' && p.imageDataUrl.startsWith('data:') ? p.imageDataUrl : null,
    calendarYmd: p.calendarAnchor instanceof Date ? ymdFromDate(p.calendarAnchor) : null,
  }
  return writePersistedPayload(payload)
}

export function writePersistedPayload(payload) {
  const str = JSON.stringify(payload)
  try {
    localStorage.setItem(PERSIST_KEY, str)
    try {
      localStorage.setItem(STORAGE_THEME, payload.theme)
      localStorage.setItem(STORAGE_LOCALE, payload.locale)
    } catch {
      /* ignore */
    }
    return true
  } catch (e) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      const smaller = { ...payload, imageDataUrl: null }
      try {
        localStorage.setItem(PERSIST_KEY, JSON.stringify(smaller))
        return true
      } catch {
        try {
          const minimal = {
            v: PERSIST_VERSION,
            savedAt: Date.now(),
            theme: payload.theme,
            locale: payload.locale,
            tab: payload.tab,
            selectedId: payload.selectedId,
            calendarYmd: payload.calendarYmd,
            scanResult: null,
            scanError: null,
            imageDataUrl: null,
          }
          localStorage.setItem(PERSIST_KEY, JSON.stringify(minimal))
          return true
        } catch {
          return false
        }
      }
    }
    return false
  }
}

export async function previewUrlToDataUrl(previewUrl) {
  if (!previewUrl) return null
  if (previewUrl.startsWith('data:')) {
    return previewUrl.length <= MAX_IMAGE_CHARS ? previewUrl : null
  }
  if (!previewUrl.startsWith('blob:')) return null
  const r = await fetch(previewUrl)
  const blob = await r.blob()
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const s = typeof fr.result === 'string' ? fr.result : null
      if (!s || s.length > MAX_IMAGE_CHARS) resolve(null)
      else resolve(s)
    }
    fr.onerror = () => reject(new Error('read'))
    fr.readAsDataURL(blob)
  })
}
