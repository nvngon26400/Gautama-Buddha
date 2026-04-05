import { useCallback, useEffect, useId, useRef, useState } from 'react'

/**
 * Mở camera qua getUserMedia — trình duyệt xin quyền, xem trước, chụp → File (JPEG).
 * Khác với &lt;input capture&gt; (hay lỗi trên iOS/WebKit khi input bị ẩn).
 */
export function CameraCaptureModal({ open, onClose, onCapture, t }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const titleId = useId()
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setError(null)
      setReady(false)
      return
    }

    setError(null)
    setReady(false)

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('unsupported')
      return
    }

    let cancelled = false

    const openCamera = async () => {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
      } catch {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
    }

    openCamera()
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop())
          return
        }
        streamRef.current = stream
        const v = videoRef.current
        if (v) {
          v.srcObject = stream
          v.onloadedmetadata = () => {
            v.play().catch(() => {})
            setReady(true)
          }
        }
      })
      .catch((e) => {
        if (cancelled) return
        if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError') {
          setError('denied')
        } else if (e?.name === 'NotFoundError' || e?.name === 'OverconstrainedError') {
          setError('noface')
        } else {
          setError('failed')
        }
      })

    return () => {
      cancelled = true
      const s = streamRef.current
      if (s) {
        s.getTracks().forEach((tr) => tr.stop())
        streamRef.current = null
      }
      const v = videoRef.current
      if (v) {
        v.srcObject = null
      }
    }
  }, [open])

  const takePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const w = video.videoWidth
    const h = video.videoHeight
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        })
        onCapture(file)
        onClose()
      },
      'image/jpeg',
      0.88,
    )
  }, [onCapture, onClose])

  const onFallbackChange = useCallback(
    (ev) => {
      const f = ev.target.files?.[0]
      ev.target.value = ''
      if (!f) return
      onCapture(f)
      onClose()
    },
    [onCapture, onClose],
  )

  if (!open) return null

  const errMsg =
    error === 'denied'
      ? t('cameraErrDenied')
      : error === 'noface'
        ? t('cameraErrNoCamera')
        : error === 'failed'
          ? t('cameraErrGeneric')
          : null

  const showVideo = error !== 'unsupported'

  return (
    <div
      className="camera-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className="camera-modal__backdrop" onClick={onClose} aria-label={t('cameraClose')} />
      <div className="camera-modal__panel">
        <h2 id={titleId} className="camera-modal__title">
          {t('cameraDialogTitle')}
        </h2>

        {error === 'unsupported' ? (
          <p className="camera-modal__warn" role="alert">
            {t('cameraErrUnsupported')}
          </p>
        ) : (
          <div className="camera-modal__viewport">
            <video
              ref={videoRef}
              className="camera-modal__video"
              autoPlay
              playsInline
              muted
            />
            {!ready && !error && (
              <p className="camera-modal__hint camera-modal__hint--overlay">{t('cameraStarting')}</p>
            )}
          </div>
        )}

        {errMsg ? (
          <p className="camera-modal__warn" role="alert">
            {errMsg}
          </p>
        ) : null}

        <div className="camera-modal__actions">
          <button
            type="button"
            className="btn primary"
            onClick={takePhoto}
            disabled={!showVideo || !ready || !!error}
          >
            {t('cameraCaptureShot')}
          </button>
          <label className="btn">
            {t('cameraPickFallback')}
            <input
              type="file"
              accept="image/*"
              className="file-input-vhidden"
              onChange={onFallbackChange}
            />
          </label>
          <button type="button" className="btn" onClick={onClose}>
            {t('cameraClose')}
          </button>
        </div>
      </div>
    </div>
  )
}
