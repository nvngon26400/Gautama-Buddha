import { Suspense, lazy, useCallback, useEffect, useId, useMemo, useState } from 'react'
import './App.css'
import { messages } from './i18n.js'
import {
  loadPersistedState,
  parseLocalYmd,
  previewUrlToDataUrl,
  saveFullSnapshot,
} from './persistState.js'
import { STORAGE_LOCALE, STORAGE_THEME } from './storageKeys.js'
import { CameraCaptureModal } from './CameraCaptureModal.jsx'
import { FigureImageCarousel } from './FigureImageCarousel.jsx'
const LunarCalendarPanel = lazy(() =>
  import('./LunarCalendarPanel.jsx').then((m) => ({ default: m.LunarCalendarPanel })),
)
import { ScanImageLightbox, buildLibraryShareText } from './ScanImageLightbox.jsx'

const api = (path) => `/api${path}`

const AUTHOR_CONTACT = {
  email: 'nvngon2604@gmail.com',
  facebook: 'https://www.facebook.com/totongonngon/',
}

export default function App() {
  const tabId = useId()
  const persisted = useMemo(() => loadPersistedState(), [])

  const [locale, setLocale] = useState(() => persisted.locale)
  const [theme, setTheme] = useState(() => persisted.theme)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const [tab, setTab] = useState(() => persisted.tab)
  const [previewUrl, setPreviewUrl] = useState(() => persisted.imageDataUrl)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState(() => persisted.scanResult)
  const [scanError, setScanError] = useState(() => persisted.scanError)
  const [previewLightboxOpen, setPreviewLightboxOpen] = useState(false)
  const [cameraModalOpen, setCameraModalOpen] = useState(false)
  const [libraryLightboxOpen, setLibraryLightboxOpen] = useState(false)
  const [libraryLightboxSlideIndex, setLibraryLightboxSlideIndex] = useState(0)

  const [figures, setFigures] = useState([])
  const [selectedId, setSelectedId] = useState(() => persisted.selectedId)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [calendarAnchor, setCalendarAnchor] = useState(() =>
    persisted.calendarYmd ? parseLocalYmd(persisted.calendarYmd) : new Date(),
  )

  const t = useCallback((key) => messages[locale][key] ?? key, [locale])

  const librarySlides = useMemo(() => {
    if (!detail?.image?.url) return []
    if (detail.images?.length) return detail.images
    return [detail.image]
  }, [detail])

  const libraryShareText = useMemo(
    () =>
      detail
        ? buildLibraryShareText(
            detail,
            locale,
            t,
            librarySlides[libraryLightboxSlideIndex] || detail.image,
          )
        : '',
    [detail, locale, t, librarySlides, libraryLightboxSlideIndex],
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_THEME, theme)
    } catch {
      /* ignore */
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#100e0c' : '#f3ebe2')
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = messages[locale].docTitle
    try {
      localStorage.setItem(STORAGE_LOCALE, locale)
    } catch {
      /* ignore */
    }
  }, [locale])

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 380)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((x) => (x === 'light' ? 'dark' : 'light'))
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      let imageDataUrl = null
      if (previewUrl?.startsWith('blob:')) {
        try {
          imageDataUrl = await previewUrlToDataUrl(previewUrl)
        } catch {
          /* ignore */
        }
      } else if (previewUrl?.startsWith('data:')) {
        imageDataUrl = previewUrl.length <= 2_400_000 ? previewUrl : null
      }
      if (cancelled) return
      saveFullSnapshot({
        theme,
        locale,
        tab,
        selectedId,
        scanResult,
        scanError,
        imageDataUrl,
        calendarAnchor,
      })
    }, 480)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [theme, locale, tab, selectedId, scanResult, scanError, previewUrl, calendarAnchor])

  useEffect(() => {
    setPreviewLightboxOpen(false)
  }, [previewUrl])

  useEffect(() => {
    if (tab !== 'scan') setPreviewLightboxOpen(false)
  }, [tab])

  useEffect(() => {
    if (tab !== 'library') setLibraryLightboxOpen(false)
  }, [tab])

  const tabIndex = tab === 'scan' ? 0 : tab === 'library' ? 1 : 2

  useEffect(() => {
    setLibraryLightboxOpen(false)
    setLibraryLightboxSlideIndex(0)
  }, [selectedId])

  useEffect(() => {
    if (tab !== 'library') return
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(api('/figures'))
        if (!r.ok) throw new Error(await r.text())
        const data = await r.json()
        if (!cancelled) setFigures(data)
      } catch {
        if (!cancelled) setFigures([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tab])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    ;(async () => {
      try {
        const r = await fetch(api(`/figures/${selectedId}?include_wiki=true`))
        if (!r.ok) throw new Error(await r.text())
        const data = await r.json()
        if (!cancelled) setDetail(data)
      } catch {
        if (!cancelled) setDetail(null)
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const applyPickedFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
    setScanResult(null)
    setScanError(null)
  }, [])

  const onPickFile = useCallback(
    (ev) => {
      const f = ev.target.files?.[0]
      ev.target.value = ''
      if (!f) return
      applyPickedFile(f)
    },
    [applyPickedFile],
  )

  const analyze = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setScanError(null)
    setScanResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('locale', locale)
      const r = await fetch(api('/analyze'), { method: 'POST', body: fd })
      const data = await r.json()
      if (!r.ok) {
        throw new Error(data?.detail || r.statusText)
      }
      setScanResult(data)
      if (data.ok === false) {
        setScanError(data.message || data.message_vi || messages[locale].errAnalyzeFallback)
      }
    } catch (e) {
      setScanError(e.message || messages[locale].errNetwork)
    } finally {
      setLoading(false)
    }
  }, [file, locale])

  const visionBlock = useMemo(() => {
    if (!scanResult?.ok || !scanResult.vision) return null
    const a = scanResult.analysis
    const m = messages[locale]
    return (
      <div className="card stack">
        <h3>{m.visionTitle}</h3>
        {scanResult.model_used && (
          <p className="fine">
            {m.modelLabel}: <code>{scanResult.model_used}</code>
            {scanResult.vision_provider && (
              <>
                {' '}
                · {m.providerLabel}: {scanResult.vision_provider}
              </>
            )}
            {scanResult.temperature != null && (
              <>
                {' '}
                · {m.tempLabel}: {scanResult.temperature}
              </>
            )}
          </p>
        )}
        {(scanResult.vision_fallback_note || scanResult.vision_fallback_note_vi) && (
          <p className="fine muted">
            {scanResult.vision_fallback_note || scanResult.vision_fallback_note_vi}
          </p>
        )}
        <p className="muted">
          <strong>{a.figure.name_vi}</strong>
          <span className="pill">
            {m.confidence}: {(a.figure.confidence * 100).toFixed(0)}%
          </span>
        </p>
        {a.figure.visual_evidence_vi?.length > 0 && (
          <>
            <h4>{m.observations}</h4>
            <ul className="list evidence">
              {a.figure.visual_evidence_vi.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </>
        )}
        <p>{a.figure.notes_vi}</p>
        <h4>{m.mudra}</h4>
        <p>
          <strong>{a.mudra.name_vi}</strong> — {a.mudra.meaning_vi}
        </p>
        <h4>{m.implements}</h4>
        {a.implements?.length ? (
          <ul className="list">
            {a.implements.map((im, i) => (
              <li key={i}>
                <strong>{im.name_vi}</strong> — {im.meaning_vi}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{m.noImplements}</p>
        )}
        <h4>{m.mindfulness}</h4>
        <p>{a.mindfulness_bridge_vi}</p>
        <p className="fine">{a.caveats_vi}</p>
      </div>
    )
  }, [scanResult, locale])

  const kbBlock = useMemo(() => {
    if (!scanResult?.merged?.knowledge) return null
    const k = scanResult.merged.knowledge
    const m = messages[locale]
    const summary = k.summary ?? k.summary_vi
    const mudras = k.mudras_common ?? k.mudras_common_vi ?? []
    const implementsList = k.implements ?? k.implements_vi ?? []
    const mindfulness = k.mindfulness_hint ?? k.mindfulness_hint_vi
    return (
      <div className="card stack">
        <h3>{m.localKb}</h3>
        <p>{summary}</p>
        <h4>{m.mudraOften}</h4>
        <ul className="list">
          {mudras.map((x, i) => (
            <li key={i}>
              <strong>{x.name}</strong> — {x.meaning}
            </li>
          ))}
        </ul>
        {implementsList.length > 0 && (
          <>
            <h4>{m.implementsOften}</h4>
            <ul className="list">
              {implementsList.map((im, i) => (
                <li key={i}>
                  <strong>{im.name}</strong> — {im.meaning}
                </li>
              ))}
            </ul>
          </>
        )}
        <h4>{m.mindfulnessKb}</h4>
        <p>{mindfulness}</p>
      </div>
    )
  }, [scanResult, locale])

  const wikiBlock = useMemo(() => {
    const w = scanResult?.wikipedia
    if (!w) return null
    const m = messages[locale]
    const excerpt = locale === 'en' ? w.en || w.vi : w.vi || w.en
    if (!excerpt) return null
    return (
      <div className="card stack wiki">
        <h3>{m.wikiTitle}</h3>
        <p>{excerpt}</p>
        <p className="fine">{m.wikiNote}</p>
      </div>
    )
  }, [scanResult, locale])

  return (
    <div className="app">
      <div className="app__bg" aria-hidden="true" />
      <a href="#main" className="skip-link">
        {t('skipNav')}
      </a>

      <header className="hero">
        <div className="hero__toolbar">
          <div className="app-controls" role="group" aria-label={t('controlsAria')}>
            <div className="lang-switch" role="group" aria-label={t('langGroup')}>
              <button
                type="button"
                aria-pressed={locale === 'vi'}
                onClick={() => setLocale('vi')}
              >
                VI
              </button>
              <button
                type="button"
                aria-pressed={locale === 'en'}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? t('themeDark') : t('themeLight')}
            >
              <span className="theme-toggle__icon" aria-hidden="true">
                {theme === 'light' ? '☀' : '☽'}
              </span>
            </button>
          </div>
        </div>

        <div className="hero__inner">
          <div className="hero__text">
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1 className="hero__title">{t('heroTitle')}</h1>
            <p className="lede">{t('heroLede')}</p>
          </div>
          <nav
            className="tabs tabs--switch tabs--count-3"
            role="tablist"
            aria-label={t('tabViewAria')}
            data-tab-index={tabIndex}
          >
            <span className="tabs__thumb" aria-hidden="true" />
            <button
              type="button"
              role="tab"
              className="tabs__btn"
              id={`${tabId}-scan`}
              aria-selected={tab === 'scan'}
              aria-controls={`${tabId}-panel-scan`}
              onClick={() => setTab('scan')}
            >
              {t('tabScan')}
            </button>
            <button
              type="button"
              role="tab"
              className="tabs__btn"
              id={`${tabId}-library`}
              aria-selected={tab === 'library'}
              aria-controls={`${tabId}-panel-library`}
              onClick={() => setTab('library')}
            >
              {t('tabLibrary')}
            </button>
            <button
              type="button"
              role="tab"
              className="tabs__btn"
              id={`${tabId}-calendar`}
              aria-selected={tab === 'calendar'}
              aria-controls={`${tabId}-panel-calendar`}
              onClick={() => setTab('calendar')}
            >
              {t('tabCalendar')}
            </button>
          </nav>
        </div>
      </header>

      <main id="main" className="main" tabIndex={-1}>
        {tab === 'scan' && (
          <section
            id={`${tabId}-panel-scan`}
            role="tabpanel"
            aria-labelledby={`${tabId}-scan`}
            className="grid"
          >
            <div className="card stack">
              <h2>{t('yourPhoto')}</h2>
              <div className="row wrap">
                <label className="btn primary">
                  {t('chooseImage')}
                  <input type="file" accept="image/*" className="file-input-vhidden" onChange={onPickFile} />
                </label>
                <button type="button" className="btn" onClick={() => setCameraModalOpen(true)}>
                  {t('cameraMobile')}
                </button>
                <button
                  type="button"
                  className={`btn primary${loading ? ' btn--loading' : ''}`}
                  disabled={!file || loading}
                  onClick={analyze}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      {t('analyzing')}
                    </>
                  ) : (
                    t('analyze')
                  )}
                </button>
              </div>
              {previewUrl && (
                <button
                  type="button"
                  className="preview preview--clickable"
                  onClick={() => setPreviewLightboxOpen(true)}
                  aria-label={t('previewOpenDetail')}
                >
                  <img src={previewUrl} alt={t('previewAlt')} />
                  <span className="preview__tap-hint fine">{t('previewTapHint')}</span>
                </button>
              )}
              <div aria-live="polite" aria-atomic="true">
                {scanError && <p className="warn">{scanError}</p>}
                {(scanResult?.hint || scanResult?.hint_vi) && !scanError && (
                  <p className="fine">{scanResult.hint || scanResult.hint_vi}</p>
                )}
              </div>
            </div>
            <div className="stack wide">
              {scanResult?.ok && scanResult.locale && scanResult.locale !== locale && (
                <p className="fine warn">{t('resultLanguageMismatch')}</p>
              )}
              {visionBlock}
              {kbBlock}
              {wikiBlock}
              {!scanResult && <p className="empty-hint">{t('emptyNoResult')}</p>}
            </div>
          </section>
        )}

        {tab === 'library' && (
          <section
            id={`${tabId}-panel-library`}
            role="tabpanel"
            aria-labelledby={`${tabId}-library`}
            className="grid library"
          >
            <div className="card stack list-panel">
              <h2>{t('figuresInKb')}</h2>
              <ul className="pick-list">
                {figures.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      className={selectedId === f.id ? 'pick on' : 'pick'}
                      aria-pressed={selectedId === f.id}
                      onClick={() => setSelectedId(f.id)}
                    >
                      {f.name_vi}
                    </button>
                  </li>
                ))}
              </ul>
              {!figures.length && <p className="muted">{t('listLoadError')}</p>}
            </div>
            <div className="stack wide">
              {detailLoading && (
                <div className="card stack" aria-live="polite">
                  <p className="muted loading-inline">
                    <span className="spinner" aria-hidden="true" />
                    {t('loading')}
                  </p>
                </div>
              )}
              {detail && (
                <>
                  <div className="card stack">
                    <h2>{detail.name_vi}</h2>
                    {librarySlides.length > 0 && (
                      <FigureImageCarousel
                        slides={librarySlides}
                        figureName={detail.name_vi}
                        locale={locale}
                        onOpenLightbox={(i) => {
                          setLibraryLightboxSlideIndex(i)
                          setLibraryLightboxOpen(true)
                        }}
                        tapHint={t('previewTapHint')}
                        previewOpenLabel={t('previewOpenDetail')}
                        prevLabel={t('carouselPrev')}
                        nextLabel={t('carouselNext')}
                        dotsAriaLabel={t('carouselDotsAria')}
                        slideDotTemplate={t('carouselSlideDot')}
                      />
                    )}
                    <p>{detail.summary_vi}</p>
                    <h3>{t('mudraCommonDetail')}</h3>
                    <ul className="list">
                      {detail.mudras_common_vi.map((x, i) => (
                        <li key={i}>
                          <strong>{x.name}</strong> — {x.meaning}
                        </li>
                      ))}
                    </ul>
                    {detail.implements_vi?.length > 0 && (
                      <>
                        <h3>{t('implementsDetail')}</h3>
                        <ul className="list">
                          {detail.implements_vi.map((im, i) => (
                            <li key={i}>
                              <strong>{im.name}</strong> — {im.meaning}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <h3>{t('mindfulnessDetail')}</h3>
                    <p>{detail.mindfulness_hint_vi}</p>
                  </div>
                  {(detail.wikipedia?.vi || detail.wikipedia?.en) && (
                    <div className="card stack wiki">
                      <h3>{t('wikipediaBrand')}</h3>
                      {detail.wikipedia.vi && <p>{detail.wikipedia.vi}</p>}
                      {!detail.wikipedia.vi && detail.wikipedia.en && <p>{detail.wikipedia.en}</p>}
                    </div>
                  )}
                </>
              )}
              {!detail && !detailLoading && selectedId === null && (
                <p className="empty-hint">{t('selectFigureHint')}</p>
              )}
            </div>
          </section>
        )}

        {tab === 'calendar' && (
          <section
            id={`${tabId}-panel-calendar`}
            role="tabpanel"
            aria-labelledby={`${tabId}-calendar`}
            className="grid cal-grid"
          >
            <Suspense
              fallback={
                <p className="muted loading-inline">
                  <span className="spinner" aria-hidden="true" />
                  {t('loading')}
                </p>
              }
            >
              <LunarCalendarPanel
                t={t}
                locale={locale}
                anchorDate={calendarAnchor}
                onAnchorDateChange={setCalendarAnchor}
              />
            </Suspense>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <p className="site-footer__disclaimer fine">{t('foot')}</p>
          <div className="site-footer__divider" aria-hidden="true" />
          <div className="site-footer__author">
            <p className="site-footer__copyright">{t('footCopyright')}</p>
            <p className="site-footer__contact-lead fine">{t('footContact')}</p>
            <div className="site-footer__links" role="group" aria-label={t('footerContactAria')}>
              <a className="site-footer__pill" href={`mailto:${AUTHOR_CONTACT.email}`}>
                <span className="site-footer__pill-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 6h16v12H4V6zm0 0l8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="site-footer__pill-text">
                  <span className="site-footer__pill-label">{t('footEmailLabel')}</span>
                  <span className="site-footer__pill-sub">{AUTHOR_CONTACT.email}</span>
                </span>
              </a>
              <a
                className="site-footer__pill site-footer__pill--fb"
                href={AUTHOR_CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="site-footer__pill-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                <span className="site-footer__pill-text">
                  <span className="site-footer__pill-label">{t('footFacebookLabel')}</span>
                  <span className="site-footer__pill-sub">facebook.com/totongonngon</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <button
        type="button"
        className={`scroll-top${showScrollTop ? ' scroll-top--visible' : ''}`}
        onClick={scrollToTop}
        aria-label={t('scrollTop')}
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
      >
        <span className="scroll-top__icon" aria-hidden="true">
          ↑
        </span>
      </button>

      <CameraCaptureModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={applyPickedFile}
        t={t}
      />

      {previewUrl && (
        <ScanImageLightbox
          open={previewLightboxOpen}
          onClose={() => setPreviewLightboxOpen(false)}
          imageUrl={previewUrl}
          file={file}
          scanResult={scanResult}
          t={t}
        />
      )}

      {librarySlides.length > 0 && tab === 'library' && detail && (
        <ScanImageLightbox
          open={libraryLightboxOpen}
          onClose={() => setLibraryLightboxOpen(false)}
          imageUrl={librarySlides[libraryLightboxSlideIndex]?.url || detail.image.url}
          shareText={libraryShareText}
          heading={detail.name_vi}
          downloadFilename={`figure-${detail.id}-${libraryLightboxSlideIndex + 1}.jpg`}
          imageAlt={
            librarySlides[libraryLightboxSlideIndex]?.alt_vi || detail.image.alt_vi || detail.name_vi
          }
          t={t}
        />
      )}
    </div>
  )
}
