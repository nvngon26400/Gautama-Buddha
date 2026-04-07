import { useEffect, useState } from 'react'
import amitabhaSplashUrl from './assets/amitabha-splash.svg?url'
import './WelcomeSplash.css'

const HOLD_MS = 2400
/** Chờ hết animation thoát (~0,65s) sau HOLD_MS */
const TOTAL_MS = 3100

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Màn chào Phật A Di Đà — ~3s rồi biến mất.
 * Dùng SVG local để tránh tải ảnh bên thứ ba gây chậm/LCP xấu.
 */
export function WelcomeSplash({ t }) {
  const [phase, setPhase] = useState('in')
  const [mounted, setMounted] = useState(() => !prefersReducedMotion())

  useEffect(() => {
    if (!mounted) return
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
