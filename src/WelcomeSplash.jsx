import { useEffect, useState } from 'react'
import amitabhaSplashUrl from './assets/amitabha-splash.svg?url'
import './WelcomeSplash.css'

/** Ảnh Phật A Di Đà (nguồn ngoài). Nếu tải lỗi → fallback SVG trong bundle. */
const REMOTE_AMITABHA_JPG =
  'https://24hstore.vn/upload_images/images/iphone-anh-phat-dep-lam-hinh-nen-dien-thoai/hinh-phat-a-di-da-an-lac-cho-man-hinh-dien-thoai.jpg'

const HOLD_MS = 2400
/** Chờ hết animation thoát (~0,65s) sau HOLD_MS */
const TOTAL_MS = 3100

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Màn chào Phật A Di Đà — ~3s rồi biến mất.
 * Ảnh: JPG từ URL (ưu tiên); fallback SVG bundle nếu không tải được.
 */
export function WelcomeSplash({ t }) {
  const [phase, setPhase] = useState('in')
  const [mounted, setMounted] = useState(() => !prefersReducedMotion())
  const [splashSrc, setSplashSrc] = useState(REMOTE_AMITABHA_JPG)

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

  const isRemotePhoto = splashSrc === REMOTE_AMITABHA_JPG

  return (
    <div
      className={`welcome-splash welcome-splash--${phase}`}
      aria-hidden="true"
    >
      <div className="welcome-splash__veil" />
      <div className="welcome-splash__content">
        <div className="welcome-splash__glow" aria-hidden="true" />
        <div
          className={`welcome-splash__figure${isRemotePhoto ? ' welcome-splash__figure--photo' : ''}`}
        >
          {isRemotePhoto ? (
            <div className="welcome-splash__photo-frame">
              <img
                className="welcome-splash__img welcome-splash__img--photo"
                src={splashSrc}
                alt=""
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                onError={() => setSplashSrc(amitabhaSplashUrl)}
              />
            </div>
          ) : (
            <img
              className="welcome-splash__img"
              src={splashSrc}
              width={124}
              height={232}
              alt=""
              decoding="async"
              fetchPriority="high"
            />
          )}
        </div>
        <p className="welcome-splash__line">{t('welcomeSplashLine')}</p>
      </div>
    </div>
  )
}
