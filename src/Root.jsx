import { useEffect } from 'react'
import App from './App.jsx'
import { AdminPage } from './AdminPage.jsx'

export function Root() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  useEffect(() => {
    try {
      if (sessionStorage.getItem('analytics_visit_sent') === '1') return
      sessionStorage.setItem('analytics_visit_sent', '1')
    } catch {
      return
    }
    fetch('/api/analytics/visit', { method: 'POST', credentials: 'omit' }).catch(() => {})
  }, [])

  if (path === '/admin') return <AdminPage />
  return <App />
}
