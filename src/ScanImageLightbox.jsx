import { useCallback, useEffect, useId, useRef, useState } from 'react'

const ZOOM_MIN = 0.5
const ZOOM_MAX = 4
const ZOOM_STEP = 0.25

function IconFrame({ children, size = 22 }) {
  return (
    <svg
      className="scan-lightbox__ico"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** Plain text khi chia sẻ ảnh từ tab Thư viện (tri thức cục bộ + Wikipedia) */
export function buildLibraryShareText(detail, locale, t, imageForCredit = null) {
  if (!detail) return ''
  const img = imageForCredit || detail.image
  const lines = []
  lines.push(t('docTitle'))
  lines.push('')
  lines.push(`— ${detail.name_vi} —`)
  lines.push('')
  lines.push(detail.summary_vi)
  lines.push('')
  lines.push(t('mudraCommonDetail'))
  for (const x of detail.mudras_common_vi || []) {
    lines.push(`• ${x.name} — ${x.meaning}`)
  }
  lines.push('')
  if (detail.implements_vi?.length) {
    lines.push(t('implementsDetail'))
    for (const im of detail.implements_vi) {
      lines.push(`• ${im.name} — ${im.meaning}`)
    }
    lines.push('')
  }
  lines.push(t('mindfulnessDetail'))
  lines.push(detail.mindfulness_hint_vi)
  const w = detail.wikipedia
  if (w?.vi || w?.en) {
    lines.push('')
    lines.push(t('wikiTitle'))
    const excerpt = locale === 'en' ? w.en || w.vi : w.vi || w.en
    if (excerpt) lines.push(excerpt)
  }
  const cr =
    locale === 'en'
      ? img?.credit_en || img?.credit_vi
      : img?.credit_vi
  if (cr) {
    lines.push('')
    lines.push(cr)
  }
  return lines.join('\n')
}

/** Plain text for share / clipboard — nội dung phân tích chủ yếu tiếng Việt từ API */
export function buildScanShareText(scanResult, t) {
  const lines = []
  lines.push(t('docTitle'))
  lines.push('')
  if (scanResult?.ok && scanResult?.analysis) {
    const a = scanResult.analysis
    lines.push(`— ${a.figure.name_vi} —`)
    lines.push(`${t('confidence')}: ${(a.figure.confidence * 100).toFixed(0)}%`)
    lines.push('')
    if (a.figure.visual_evidence_vi?.length) {
      lines.push(t('observations'))
      for (const line of a.figure.visual_evidence_vi) {
        lines.push(`• ${line}`)
      }
      lines.push('')
    }
    lines.push(a.figure.notes_vi)
    lines.push('')
    lines.push(`${t('mudra')}: ${a.mudra.name_vi} — ${a.mudra.meaning_vi}`)
    lines.push('')
    if (a.implements?.length) {
      lines.push(t('implements'))
      for (const im of a.implements) {
        lines.push(`• ${im.name_vi} — ${im.meaning_vi}`)
      }
      lines.push('')
    }
    lines.push(`${t('mindfulness')}: ${a.mindfulness_bridge_vi}`)
    lines.push('')
    lines.push(a.caveats_vi)
    const w = scanResult.wikipedia
    if (w?.vi || w?.en) {
      lines.push('')
      lines.push(t('wikiTitle'))
      if (w.vi) lines.push(w.vi)
      else if (w.en) lines.push(w.en)
    }
  } else {
    lines.push(t('previewShareNoAnalysis'))
  }
  return lines.join('\n')
}

export function ScanImageLightbox({
  open,
  onClose,
  imageUrl,
  file = null,
  scanResult = null,
  shareText: shareTextOverride = null,
  heading = null,
  downloadFilename = null,
  imageAlt = null,
  t,
}) {
  const dialogRef = useRef(null)
  const viewportRef = useRef(null)
  const titleId = useId()
  const [zoom, setZoom] = useState(1)
  const [shareNote, setShareNote] = useState(null)

  useEffect(() => {
    if (open) setZoom(1)
  }, [open])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else if (el.open) {
      el.close()
    }
  }, [open])

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp || !open) return
    const onWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)))
    }
    vp.addEventListener('wheel', onWheel, { passive: false })
    return () => vp.removeEventListener('wheel', onWheel)
  }, [open])

  useEffect(() => {
    if (!shareNote) return
    const id = window.setTimeout(() => setShareNote(null), 2800)
    return () => window.clearTimeout(id)
  }, [shareNote])

  const onDialogClose = useCallback(() => {
    onClose()
  }, [onClose])

  const onBackdropClick = useCallback((e) => {
    if (e.target === dialogRef.current) {
      dialogRef.current?.close()
    }
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))
  }, [])

  const resetZoom = useCallback(() => setZoom(1), [])

  const download = useCallback(async () => {
    if (!imageUrl) return
    const baseName =
      downloadFilename || file?.name || 'buddha-image.jpg'
    if (file && imageUrl.startsWith('blob:')) {
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = baseName
      a.rel = 'noopener'
      a.click()
      return
    }
    try {
      const r = await fetch(imageUrl, { mode: 'cors' })
      const blob = await r.blob()
      const u = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = u
      a.download = baseName.replace(/[^\w.\-]+/g, '_')
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(u)
    } catch {
      try {
        const a = document.createElement('a')
        a.href = imageUrl
        a.download = baseName
        a.rel = 'noopener'
        a.target = '_blank'
        a.click()
      } catch {
        window.open(imageUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }, [imageUrl, file, downloadFilename])

  const share = useCallback(async () => {
    const text =
      shareTextOverride != null ? shareTextOverride : buildScanShareText(scanResult, t)
    const title = t('docTitle')
    let shareFile = file
    if (!shareFile && imageUrl?.startsWith('http')) {
      try {
        const r = await fetch(imageUrl, { mode: 'cors' })
        const blob = await r.blob()
        const fn = downloadFilename || 'figure-image.jpg'
        shareFile = new File([blob], fn.replace(/[^\w.\-]+/g, '_'), {
          type: blob.type || 'image/jpeg',
        })
      } catch {
        shareFile = null
      }
    }
    try {
      if (shareFile && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({ files: [shareFile], title, text })
        return
      }
      if (navigator.share) {
        await navigator.share({ title, text })
        return
      }
    } catch (e) {
      if (e?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareNote(t('previewShareCopied'))
    } catch {
      window.prompt(t('previewShareCopyFallback'), text)
    }
  }, [file, scanResult, t, shareTextOverride, imageUrl, downloadFilename])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') return
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        resetZoom()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, zoomIn, zoomOut, resetZoom])

  if (!imageUrl) return null

  const pct = Math.round(zoom * 100)

  return (
    <dialog
      ref={dialogRef}
      className="scan-lightbox"
      aria-labelledby={titleId}
      aria-modal="true"
      onClose={onDialogClose}
      onClick={onBackdropClick}
    >
      <div className="scan-lightbox__inner" onClick={(e) => e.stopPropagation()}>
        <div className="scan-lightbox__layer scan-lightbox__layer--vignette" aria-hidden />

        <header className="scan-lightbox__top">
          <div className="scan-lightbox__glass scan-lightbox__glass--title">
            <h2 id={titleId} className="scan-lightbox__heading">
              {heading ?? t('previewLightboxTitle')}
            </h2>
          </div>
          <button
            type="button"
            className="scan-lightbox__fab scan-lightbox__fab--close"
            onClick={() => dialogRef.current?.close()}
            aria-label={t('previewClose')}
          >
            <IconFrame size={22}>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </IconFrame>
          </button>
        </header>

        <div ref={viewportRef} className="scan-lightbox__viewport">
          <img
            src={imageUrl}
            alt={imageAlt ?? t('previewAlt')}
            className="scan-lightbox__img"
            style={{ transform: `scale(${zoom})` }}
            draggable={false}
          />
        </div>

        <footer className="scan-lightbox__bottom">
          {shareNote && (
            <div className="scan-lightbox__toast scan-lightbox__toast--float" role="status">
              {shareNote}
            </div>
          )}

          <div className="scan-lightbox__dock-wrap">
            <div className="scan-lightbox__glass scan-lightbox__glass--dock">
              <div
                className="scan-lightbox__zoom"
                role="group"
                aria-label={t('previewZoomGroup')}
              >
                <button
                  type="button"
                  className="scan-lightbox__icon-btn"
                  onClick={zoomOut}
                  aria-label={t('previewZoomOut')}
                >
                  <IconFrame size={20}>
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </IconFrame>
                </button>
                <output className="scan-lightbox__zoom-readout" aria-live="polite">
                  {pct}%
                </output>
                <button
                  type="button"
                  className="scan-lightbox__icon-btn"
                  onClick={zoomIn}
                  aria-label={t('previewZoomIn')}
                >
                  <IconFrame size={20}>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </IconFrame>
                </button>
                <span className="scan-lightbox__zoom-divider" aria-hidden />
                <button
                  type="button"
                  className="scan-lightbox__icon-btn scan-lightbox__icon-btn--compact"
                  onClick={resetZoom}
                  aria-label={t('previewResetZoom')}
                  title={t('previewResetZoom')}
                >
                  1:1
                </button>
              </div>

              <span className="scan-lightbox__dock-divider" aria-hidden />

              <div className="scan-lightbox__actions">
                <button type="button" className="scan-lightbox__cta" onClick={download}>
                  <IconFrame size={20}>
                    <path
                      d="M12 4v11m0 0l-3.5-3.5M12 15l3.5-3.5M5 19h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </IconFrame>
                  <span>{t('previewDownload')}</span>
                </button>
                <button type="button" className="scan-lightbox__cta scan-lightbox__cta--ghost" onClick={share}>
                  <IconFrame size={20}>
                    <circle cx="18" cy="5" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="18" cy="19" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M8.35 13.6l6.5 3.75M15.65 7.65L9 11.4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </IconFrame>
                  <span>{t('previewShare')}</span>
                </button>
              </div>
            </div>
            <p className="scan-lightbox__hint">{t('previewWheelZoom')}</p>
          </div>
        </footer>
      </div>
    </dialog>
  )
}
