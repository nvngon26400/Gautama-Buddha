import { useEffect, useState } from 'react'
import amitabhaSplashUrl from './assets/amitabha-splash.svg?url'
import './WelcomeSplash.css'

const HOLD_MS = 850
/** Chờ hết animation thoát (~0,65s) sau HOLD_MS */
const TOTAL_MS = 1350

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function shouldSkipSplash() {
  if (typeof window === 'undefined') return true
  if (prefersReducedMotion()) return true
  if (window.matchMedia('(max-width: 768px)').matches) return true
  try {
    const nav = navigator
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection
    if (conn?.saveData) return true
    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true
    if (sessionStorage.getItem('welcome_splash_seen') === '1') return true
  } catch {
    /* ignore */
  }
  return false
}

/**
 * Màn chào Phật A Di Đà — ~3s rồi biến mất.
 * Dùng SVG local để tránh tải ảnh bên thứ ba gây chậm/LCP xấu.
 */
export function WelcomeSplash({ t }) {
  const [phase, setPhase] = useState('in')
  const [mounted, setMounted] = useState(() => !shouldSkipSplash())

  useEffect(() => {
    if (!mounted) return
    try {
      sessionStorage.setItem('welcome_splash_seen', '1')
    } catch {
      /* ignore */
    }
    const tExit = setTimeout(() => setPhase('out'), HOLD_MS)
    const tDone = setTimeout(() => setMounted(false), TOTAL_MS)
    return () => {
      clearTimeout(tExit)
      clearTimeout(tDone)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div
      className={`welcome-splash welcome-splash--${phase}`}
      aria-hidden="true"
    >
      <div className="welcome-splash__veil" />
      <div className="welcome-splash__content">
        <div className="welcome-splash__glow" aria-hidden="true" />
        <div className="welcome-splash__figure">
          <img
            className="welcome-splash__img"
            src={amitabhaSplashUrl}
            width={124}
            height={232}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <p className="welcome-splash__line">{t('welcomeSplashLine')}</p>
      </div>
    </div>
  )
}
