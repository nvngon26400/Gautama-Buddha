import { useCallback, useEffect, useState } from 'react'
import './App.css'
import './AdminPage.css'
import { STORAGE_THEME } from './storageKeys.js'

const api = (path) => `/api${path}`

const STORAGE_TOKEN = 'admin_analytics_token'

const tabs = [
  { id: 'day', label: 'Theo ngày' },
  { id: 'week', label: 'Theo tuần' },
  { id: 'month', label: 'Theo tháng' },
  { id: 'year', label: 'Theo năm' },
]

function formatTs(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'UTC',
    }).format(d)
  } catch {
    return iso
  }
}

export function AdminPage() {
  const [tokenInput, setTokenInput] = useState('')
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_TOKEN) || ''
    } catch {
      return ''
    }
  })
  const [granularity, setGranularity] = useState('day')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Thống kê truy cập — Quản trị'
    try {
      const theme = localStorage.getItem(STORAGE_THEME) || 'light'
      document.documentElement.setAttribute('data-theme', theme)
    } catch {
      /* ignore */
    }
  }, [])

  const load = useCallback(async () => {
    if (!token?.trim()) {
      setError('Nhập mật khẩu quản trị (ADMIN_ANALYTICS_SECRET trên server).')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(api(`/analytics/dashboard?granularity=${encodeURIComponent(granularity)}`), {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })
      const body = await r.json().catch(() => ({}))
      if (r.status === 503 && body?.detail === 'admin_analytics_disabled') {
        setError('Chưa bật quản trị: đặt ADMIN_ANALYTICS_SECRET trong server/.env và khởi động lại API.')
        setData(null)
        return
      }
      if (r.status === 401) {
        setError('Sai mật khẩu hoặc chưa đăng nhập.')
        setData(null)
        return
      }
      if (!r.ok) {
        setError(body?.detail || `Lỗi ${r.status}`)
        setData(null)
        return
      }
      setData(body)
    } catch (e) {
      setError(e?.message || 'Lỗi mạng — kiểm tra API đang chạy.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [token, granularity])

  useEffect(() => {
    if (token?.trim()) load()
  }, [token, granularity, load])

  const saveToken = () => {
    const t = tokenInput.trim()
    setToken(t)
    try {
      if (t) sessionStorage.setItem(STORAGE_TOKEN, t)
      else sessionStorage.removeItem(STORAGE_TOKEN)
    } catch {
      /* ignore */
    }
    setTokenInput('')
  }

  const logout = () => {
    setToken('')
    setData(null)
    try {
      sessionStorage.removeItem(STORAGE_TOKEN)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <h1 className="admin-page__title">Thống kê lưu lượng</h1>
        <p className="admin-page__lede fine muted">
          Theo dõi lượt mở ứng dụng theo ngày / tuần / tháng / năm; IP và trình duyệt (User-Agent) ghi khi có API.
        </p>
        <p className="admin-page__warn fine">
          Lưu ý: IP phụ thuộc proxy (Vercel gửi qua X-Forwarded-For). Trên serverless, file SQLite trong /tmp có thể
          không bền — nên chạy API trên máy chủ có ổ đĩa hoặc đặt ANALYTICS_DB_PATH trỏ tới volume.
        </p>
        <nav className="admin-page__nav">
          <a className="admin-page__home" href="/">
            ← Về trang chủ
          </a>
        </nav>
      </header>

      <section className="admin-page__card card stack">
        <h2 className="admin-page__h2">Đăng nhập quản trị</h2>
        <p className="fine muted">
          Mật khẩu là giá trị biến môi trường <code>ADMIN_ANALYTICS_SECRET</code> (không đưa vào code frontend).
        </p>
        <div className="admin-page__row">
          <input
            type="password"
            className="admin-page__input"
            autoComplete="off"
            placeholder="Mật khẩu quản trị"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveToken()}
          />
          <button type="button" className="btn primary" onClick={saveToken}>
            {token ? 'Cập nhật mật khẩu' : 'Lưu và tải dữ liệu'}
          </button>
          {token ? (
            <button type="button" className="btn ghost" onClick={logout}>
              Xóa phiên
            </button>
          ) : null}
        </div>
        {error ? <p className="admin-page__err">{error}</p> : null}
      </section>

      {token ? (
        <>
          <div className="admin-page__tabs" role="tablist" aria-label="Cách nhóm thống kê">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={granularity === tab.id}
                className={`admin-page__tab${granularity === tab.id ? ' admin-page__tab--on' : ''}`}
                onClick={() => setGranularity(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="muted loading-inline">
              <span className="spinner" aria-hidden="true" />
              Đang tải…
            </p>
          ) : null}

          {data && !loading ? (
            <>
              <section className="admin-page__card card stack">
                <h2 className="admin-page__h2">Tổng trong khoảng</h2>
                <p className="fine muted">{data.period_label}</p>
                <ul className="admin-page__kpi">
                  <li>
                    <span className="admin-page__kpi-label">Tổng lượt ghi nhận</span>
                    <strong className="admin-page__kpi-val">{data.totals?.visits ?? 0}</strong>
                  </li>
                  <li>
                    <span className="admin-page__kpi-label">Số IP khác nhau</span>
                    <strong className="admin-page__kpi-val">{data.totals?.unique_ips ?? 0}</strong>
                  </li>
                </ul>
              </section>

              <section className="admin-page__card card stack">
                <h2 className="admin-page__h2">Chi tiết theo từng mốc</h2>
                <div className="admin-page__table-wrap">
                  <table className="admin-page__table">
                    <thead>
                      <tr>
                        <th>Mốc thời gian</th>
                        <th>Lượt</th>
                        <th>IP duy nhất</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.buckets || []).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="muted">
                            Chưa có dữ liệu trong khoảng này.
                          </td>
                        </tr>
                      ) : (
                        data.buckets.map((b) => (
                          <tr key={b.label}>
                            <td>
                              <code>{b.label}</code>
                            </td>
                            <td>{b.visits}</td>
                            <td>{b.unique_ips}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="admin-page__card card stack">
                <h2 className="admin-page__h2">IP truy cập nhiều nhất (trong khoảng)</h2>
                <div className="admin-page__table-wrap">
                  <table className="admin-page__table">
                    <thead>
                      <tr>
                        <th>IP</th>
                        <th>Lượt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.top_ips || []).length === 0 ? (
                        <tr>
                          <td colSpan={2} className="muted">
                            Chưa có dữ liệu.
                          </td>
                        </tr>
                      ) : (
                        data.top_ips.map((row) => (
                          <tr key={row.ip}>
                            <td>
                              <code>{row.ip}</code>
                            </td>
                            <td>{row.visits}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="admin-page__card card stack">
                <h2 className="admin-page__h2">Lượt gần đây (chi tiết)</h2>
                <p className="fine muted">Tối đa 120 bản ghi mới nhất trong khoảng thống kê hiện tại.</p>
                <div className="admin-page__table-wrap">
                  <table className="admin-page__table admin-page__table--wide">
                    <thead>
                      <tr>
                        <th>Thời điểm (UTC)</th>
                        <th>IP</th>
                        <th>User-Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.recent || []).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="muted">
                            Chưa có lượt nào.
                          </td>
                        </tr>
                      ) : (
                        data.recent.map((row, i) => (
                          <tr key={`${row.ts}-${i}`}>
                            <td className="admin-page__nowrap">{formatTs(row.ts)}</td>
                            <td>
                              <code>{row.ip}</code>
                            </td>
                            <td className="admin-page__ua">{row.user_agent || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
