const SCAN_HISTORY_KEY = 'gautama-scan-history-v1'
const HISTORY_TTL_MS = 365 * 24 * 60 * 60 * 1000
const MAX_ITEMS = 48
const MAX_IMAGE_CHARS = 900_000

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function nowMs() {
  return Date.now()
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null
  if (typeof item.id !== 'string' || !item.id) return null
  if (typeof item.createdAt !== 'number' || !Number.isFinite(item.createdAt)) return null
  if (typeof item.result !== 'object' || !item.result) return null
  const imageDataUrl =
    typeof item.imageDataUrl === 'string' && item.imageDataUrl.startsWith('data:') ? item.imageDataUrl : null
  return {
    id: item.id,
    createdAt: item.createdAt,
    locale: item.locale === 'en' ? 'en' : 'vi',
    imageDataUrl,
    result: item.result,
  }
}

function prune(items) {
  const cutoff = nowMs() - HISTORY_TTL_MS
  return items
    .map(normalizeItem)
    .filter(Boolean)
    .filter((x) => x.createdAt >= cutoff)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_ITEMS)
}

function readRaw() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY)
    if (!raw) return []
    const arr = safeParse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeRaw(items) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(items))
}

export function loadScanHistory() {
  const clean = prune(readRaw())
  try {
    writeRaw(clean)
  } catch {
    /* ignore */
  }
  return clean
}

export function addScanHistoryEntry({ locale, imageDataUrl, result }) {
  const safeImage =
    typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:') && imageDataUrl.length <= MAX_IMAGE_CHARS
      ? imageDataUrl
      : null
  const entry = {
    id: `${nowMs()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: nowMs(),
    locale: locale === 'en' ? 'en' : 'vi',
    imageDataUrl: safeImage,
    result,
  }
  const next = prune([entry, ...readRaw()])
  try {
    writeRaw(next)
    return next
  } catch (e) {
    if (e?.name !== 'QuotaExceededError' && e?.code !== 22) return next
    const reduced = next.map((x) => ({ ...x, imageDataUrl: null }))
    try {
      writeRaw(reduced)
      return reduced
    } catch {
      const minimal = reduced.slice(0, 20)
      try {
        writeRaw(minimal)
        return minimal
      } catch {
        return loadScanHistory()
      }
    }
  }
}

export function removeScanHistoryEntry(id) {
  const next = prune(readRaw().filter((x) => x?.id !== id))
  try {
    writeRaw(next)
  } catch {
    /* ignore */
  }
  return next
}

export function clearScanHistory() {
  try {
    localStorage.removeItem(SCAN_HISTORY_KEY)
  } catch {
    /* ignore */
  }
  return []
}
