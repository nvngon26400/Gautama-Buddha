import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const api = (path) => `/api${path}`

export default function App() {
  const [tab, setTab] = useState('scan')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)

  const [figures, setFigures] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

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

  const onPickFile = useCallback((ev) => {
    const f = ev.target.files?.[0]
    ev.target.value = ''
    if (!f) return
    setFile(f)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
    setScanResult(null)
    setScanError(null)
  }, [])

  const analyze = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setScanError(null)
    setScanResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch(api('/analyze'), { method: 'POST', body: fd })
      const data = await r.json()
      if (!r.ok) {
        throw new Error(data?.detail || r.statusText)
      }
      setScanResult(data)
      if (data.ok === false) {
        setScanError(data.message_vi || 'Không phân tích được ảnh.')
      }
    } catch (e) {
      setScanError(e.message || 'Lỗi mạng hoặc server.')
    } finally {
      setLoading(false)
    }
  }, [file])

  const visionBlock = useMemo(() => {
    if (!scanResult?.ok || !scanResult.vision) return null
    const a = scanResult.analysis
    return (
      <div className="card stack">
        <h3>Kết quả phân tích ảnh</h3>
        {scanResult.model_used && (
          <p className="fine">
            Mô hình: <code>{scanResult.model_used}</code>
            {scanResult.temperature != null && (
              <> · nhiệt độ: {scanResult.temperature}</>
            )}
          </p>
        )}
        <p className="muted">
          <strong>{a.figure.name_vi}</strong>
          <span className="pill">Độ tin cậy: {(a.figure.confidence * 100).toFixed(0)}%</span>
        </p>
        {a.figure.visual_evidence_vi?.length > 0 && (
          <>
            <h4>Quan sát từ ảnh</h4>
            <ul className="list evidence">
              {a.figure.visual_evidence_vi.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </>
        )}
        <p>{a.figure.notes_vi}</p>
        <h4>Thủ ấn (mudra)</h4>
        <p>
          <strong>{a.mudra.name_vi}</strong> — {a.mudra.meaning_vi}
        </p>
        <h4>Pháp khí</h4>
        {a.implements?.length ? (
          <ul className="list">
            {a.implements.map((im, i) => (
              <li key={i}>
                <strong>{im.name_vi}</strong> — {im.meaning_vi}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Không ghi nhận pháp khí rõ ràng.</p>
        )}
        <h4>Gợi ý chánh niệm</h4>
        <p>{a.mindfulness_bridge_vi}</p>
        <p className="fine">{a.caveats_vi}</p>
      </div>
    )
  }, [scanResult])

  const kbBlock = useMemo(() => {
    if (!scanResult?.merged?.knowledge) return null
    const k = scanResult.merged.knowledge
    return (
      <div className="card stack">
        <h3>Tri thức cục bộ</h3>
        <p>{k.summary_vi}</p>
        <h4>Thủ ấn thường gặp</h4>
        <ul className="list">
          {k.mudras_common_vi.map((m, i) => (
            <li key={i}>
              <strong>{m.name}</strong> — {m.meaning}
            </li>
          ))}
        </ul>
        {k.implements_vi?.length > 0 && (
          <>
            <h4>Pháp khí thường gặp</h4>
            <ul className="list">
              {k.implements_vi.map((im, i) => (
                <li key={i}>
                  <strong>{im.name}</strong> — {im.meaning}
                </li>
              ))}
            </ul>
          </>
        )}
        <h4>Gợi ý chánh niệm (kho tri thức)</h4>
        <p>{k.mindfulness_hint_vi}</p>
      </div>
    )
  }, [scanResult])

  const wikiBlock = useMemo(() => {
    const w = scanResult?.wikipedia
    if (!w) return null
    const has = w.vi || w.en
    if (!has) return null
    return (
      <div className="card stack wiki">
        <h3>Wikipedia (trích lược)</h3>
        {w.vi && <p>{w.vi}</p>}
        {!w.vi && w.en && <p>{w.en}</p>}
        <p className="fine">Nội dung tham khảo từ Wikipedia; có thể khác biệt theo truyền thống tông phái.</p>
      </div>
    )
  }, [scanResult])

  return (
    <div className="app">
      <header className="top">
        <div>
          <p className="eyebrow">Buddhist Iconography</p>
          <h1>Nhận diện tượng &amp; ý nghĩa</h1>
          <p className="lede">
            Chụp hoặc tải ảnh tượng Phật/Bồ Tát để nhận gợi ý về thủ ấn, pháp khí và mối liên hệ với chánh niệm.
            {/* Cần <code>OPENAI_API_KEY</code> trên server; mặc định dùng <code>gpt-4o</code> (có thể đổi bằng{' '}
            <code>OPENAI_VISION_MODEL</code>). */}
          </p>
        </div>
        <nav className="tabs" aria-label="Chế độ">
          <button type="button" className={tab === 'scan' ? 'on' : ''} onClick={() => setTab('scan')}>
            Ảnh
          </button>
          <button type="button" className={tab === 'library' ? 'on' : ''} onClick={() => setTab('library')}>
            Thư viện
          </button>
        </nav>
      </header>

      {tab === 'scan' && (
        <section className="grid">
          <div className="card stack">
            <h2>Ảnh</h2>
            <div className="row wrap">
              <label className="btn primary">
                Chọn ảnh
                <input type="file" accept="image/*" hidden onChange={onPickFile} />
              </label>
              <label className="btn">
                Máy ảnh (di động)
                <input type="file" accept="image/*" capture="environment" hidden onChange={onPickFile} />
              </label>
              <button type="button" className="btn" disabled={!file || loading} onClick={analyze}>
                {loading ? 'Đang phân tích…' : 'Phân tích'}
              </button>
            </div>
            {previewUrl && (
              <figure className="preview">
                <img src={previewUrl} alt="Xem trước" />
              </figure>
            )}
            {scanError && <p className="warn">{scanError}</p>}
            {scanResult?.hint_vi && <p className="fine">{scanResult.hint_vi}</p>}
          </div>
          <div className="stack wide">
            {visionBlock}
            {kbBlock}
            {wikiBlock}
            {!scanResult && (
              <p className="muted center">Chưa có kết quả. Chọn ảnh và bấm Phân tích.</p>
            )}
          </div>
        </section>
      )}

      {tab === 'library' && (
        <section className="grid library">
          <div className="card stack list-panel">
            <h2>Nhân vật trong kho tri thức</h2>
            <ul className="pick-list">
              {figures.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    className={selectedId === f.id ? 'pick on' : 'pick'}
                    onClick={() => setSelectedId(f.id)}
                  >
                    {f.name_vi}
                  </button>
                </li>
              ))}
            </ul>
            {!figures.length && <p className="muted">Không tải được danh sách — hãy chạy API server.</p>}
          </div>
          <div className="stack wide">
            {detailLoading && <p className="muted">Đang tải…</p>}
            {detail && (
              <>
                <div className="card stack">
                  <h2>{detail.name_vi}</h2>
                  <p>{detail.summary_vi}</p>
                  <h3>Thủ ấn thường gặp</h3>
                  <ul className="list">
                    {detail.mudras_common_vi.map((m, i) => (
                      <li key={i}>
                        <strong>{m.name}</strong> — {m.meaning}
                      </li>
                    ))}
                  </ul>
                  {detail.implements_vi?.length > 0 && (
                    <>
                      <h3>Pháp khí</h3>
                      <ul className="list">
                        {detail.implements_vi.map((im, i) => (
                          <li key={i}>
                            <strong>{im.name}</strong> — {im.meaning}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <h3>Chánh niệm</h3>
                  <p>{detail.mindfulness_hint_vi}</p>
                </div>
                {(detail.wikipedia?.vi || detail.wikipedia?.en) && (
                  <div className="card stack wiki">
                    <h3>Wikipedia</h3>
                    {detail.wikipedia.vi && <p>{detail.wikipedia.vi}</p>}
                    {!detail.wikipedia.vi && detail.wikipedia.en && <p>{detail.wikipedia.en}</p>}
                  </div>
                )}
              </>
            )}
            {!detail && !detailLoading && selectedId === null && (
              <p className="muted">Chọn một nhân vật để xem chi tiết và trích Wikipedia.</p>
            )}
          </div>
        </section>
      )}

      <footer className="foot fine">
        Công cụ học tập — không thay thế hướng dẫn của người có học. Phân tích ảnh phụ thuộc mô hình AI và có thể sai.
      </footer>
    </div>
  )
}
