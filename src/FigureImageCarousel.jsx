import { useCallback, useEffect, useId, useState } from 'react'

const CREDIT_VI = 'Ảnh: Wikimedia Commons — xem trang tệp trên Commons để biết tác giả và giấy phép sử dụng.'
const CREDIT_EN = 'Image: Wikimedia Commons — see the file page on Commons for author and license.'

function slideDotAria(template, i, n) {
  return template.replace('{current}', String(i + 1)).replace('{total}', String(n))
}

export function FigureImageCarousel({
  slides,
  figureName,
  locale,
  onOpenLightbox,
  tapHint,
  previewOpenLabel,
  prevLabel = 'Previous image',
  nextLabel = 'Next image',
  dotsAriaLabel = 'Slides',
  slideDotTemplate = 'Image {current} of {total}',
}) {
  const carouselId = useId()
  const [index, setIndex] = useState(0)
  const n = slides?.length ?? 0

  useEffect(() => {
    setIndex(0)
  }, [slides])

  const go = useCallback(
    (delta) => {
      if (n <= 1) return
      setIndex((i) => (i + delta + n) % n)
    },
    [n],
  )

  if (!n) return null

  const current = slides[index]
  const credit = locale === 'en' ? current.credit_en || current.credit_vi || CREDIT_EN : current.credit_vi || CREDIT_VI

  return (
    <figure className="figure-detail__media figure-detail__media--carousel">
      <div className="figure-carousel" aria-roledescription="carousel" aria-labelledby={`${carouselId}-title`}>
        <span id={`${carouselId}-title`} className="sr-only">
          {figureName}
        </span>
        <div className="figure-carousel__viewport">
          <button
            type="button"
            className="figure-detail__img-hit figure-carousel__hit"
            onClick={() => onOpenLightbox(index)}
            aria-label={previewOpenLabel}
          >
            <img
              src={current.url}
              alt={current.alt_vi || figureName}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </button>
          {n > 1 && (
            <>
              <button
                type="button"
                className="figure-carousel__nav figure-carousel__nav--prev"
                onClick={() => go(-1)}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className="figure-carousel__nav figure-carousel__nav--next"
                onClick={() => go(1)}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
        </div>
        {n > 1 && (
          <div className="figure-carousel__dots" role="tablist" aria-label={dotsAriaLabel}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={slideDotAria(slideDotTemplate, i, n)}
                className={`figure-carousel__dot${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
        <span className="figure-detail__tap-hint fine">{tapHint}</span>
        <figcaption className="figure-detail__credit fine">{credit}</figcaption>
      </div>
    </figure>
  )
}
