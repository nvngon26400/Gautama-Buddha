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
  const cr = locale === 'en' ? img?.credit_en || img?.credit_vi : img?.credit_vi
  if (cr) {
    lines.push('')
    lines.push(cr)
  }
  return lines.join('\n')
}
