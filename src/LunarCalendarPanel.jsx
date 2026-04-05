import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { localizeFestivalName } from './calendar/localizeDisplay.js'
import { buildLunarDayInfo } from './lunarDayInfo.js'
import { getZodiacDailyLine } from './zodiacFortune.js'

const ZODIAC_EMOJI = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐐', '🐵', '🐔', '🐶', '🐷']

function pad2(n) {
  return String(n).padStart(2, '0')
}

function toInputValue(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function parseLocalYmd(s) {
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d, 12, 0, 0)
}

function formatClock(d, locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d)
}

function formatWeekday(d, locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    weekday: 'long',
  }).format(d)
}

function formatSolarLong(d, locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/** Tách lễ Phật / lễ khác từ danh sách lịch Foto (chữ Hán) */
function splitFotoFestivals(names) {
  const buddhaRe =
    /佛|菩萨|释迦牟尼|观世音|地藏|文殊|普贤|弥勒|药师|韦陀|达摩|罗汉|阿弥陀佛|定光|准提|燃灯|月光|摩利支|华严|药王|伽蓝|龙树|监斋|出家|涅槃|圣诞|成道|成道日|佛诞|观音|地藏/
  const buddhist = []
  const other = []
  for (const n of names) {
    if (buddhaRe.test(n)) buddhist.push(n)
    else other.push(n)
  }
  return { buddhist, other }
}

export function LunarCalendarPanel({ t, locale }) {
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [nowTick, setNowTick] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNowTick(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const info = useMemo(() => buildLunarDayInfo(anchorDate, locale), [anchorDate, locale])

  const { buddhist: fotoBuddhist, other: fotoOther } = useMemo(
    () => splitFotoFestivals(info.foto.festivalsZh),
    [info.foto.festivalsZh],
  )

  const onDateInput = useCallback((e) => {
    setAnchorDate(parseLocalYmd(e.target.value))
  }, [])

  const goToday = useCallback(() => setAnchorDate(new Date()), [])

  const isToday =
    anchorDate.getFullYear() === nowTick.getFullYear() &&
    anchorDate.getMonth() === nowTick.getMonth() &&
    anchorDate.getDate() === nowTick.getDate()

  const lunarPrimary = locale === 'en' ? info.lunar.primaryEn : info.lunar.primaryVi

  const transition = { type: 'spring', stiffness: 420, damping: 32 }

  return (
    <div className="cal">
      <motion.div
        className="cal__hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <div className="cal__hero-bg" aria-hidden="true" />
        <div className="cal__hero-top">
          <div className="cal__clock-wrap">
            <p className="cal__clock-label">{t('calLiveClock')}</p>
            <p className="cal__clock">{formatClock(nowTick, locale)}</p>
          </div>
          <div className="cal__hero-actions">
            <label className="cal__date-label">
              <span className="sr-only">{t('calPickDate')}</span>
              <input
                className="cal__date-input"
                type="date"
                value={toInputValue(anchorDate)}
                onChange={onDateInput}
              />
            </label>
            <button type="button" className="cal__today-btn" onClick={goToday} disabled={isToday}>
              {t('calToday')}
            </button>
          </div>
        </div>
        <p className="cal__weekday">{formatWeekday(anchorDate, locale)}</p>
        <p className="cal__block-label">{t('calSolarBlockTitle')}</p>
        <h2 className="cal__solar">{formatSolarLong(anchorDate, locale)}</h2>
        <p className="cal__block-label cal__block-label--lunar">{t('calLunarBlockTitle')}</p>
        <p className="cal__lunar-primary">{lunarPrimary}</p>
        <p className="cal__lunar-han">
          <span className="cal__han-label">{t('calHanLineLabel')}:</span> {info.lunar.hanLine}
        </p>
        {info.jieQiToday ? (
          <p className="cal__jieqi">
            <span className="cal__badge">{t('calSolarTerm')}</span> {info.jieQiToday}
          </p>
        ) : null}
      </motion.div>

      {(info.holidays.length > 0 || info.foto.festivalsZh.length > 0 || info.jieQiToday) && (
        <motion.section
          className="cal__section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.05 }}
        >
          <h3 className="cal__h">{t('calHolidaysTitle')}</h3>
          <div className="cal__chips">
            {info.holidays.map((h) => (
              <span key={h.kind + (h.vi || h.en)} className="cal__chip cal__chip--vn">
                {locale === 'en' ? h.en : h.vi}
              </span>
            ))}
            {info.jieQiToday ? (
              <span className="cal__chip cal__chip--term">{info.jieQiToday}</span>
            ) : null}
          </div>
        </motion.section>
      )}

      {(fotoBuddhist.length > 0 ||
        info.foto.otherFestivalsZh.length > 0 ||
        info.buddhistFlags.isMonthZhai ||
        info.buddhistFlags.isDayZhaiShuoWang ||
        info.buddhistFlags.isDayZhaiSix ||
        info.buddhistFlags.isDayZhaiTen ||
        info.buddhistFlags.isDayZhaiGuanYin) && (
        <motion.section
          className="cal__section cal__section--buddha"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.08 }}
        >
          <h3 className="cal__h">{t('calBuddhistTitle')}</h3>
          <div className="cal__buddha-card">
            {[...new Set([...fotoBuddhist, ...info.foto.otherFestivalsZh])].map((zh) => (
              <p key={zh} className="cal__buddha-line">
                {localizeFestivalName(zh, locale, info.foto.nameEnByZh[zh])}
              </p>
            ))}
            <ul className="cal__zhai-list">
              {info.buddhistFlags.isMonthZhai ? <li>{t('calZhaiMonth')}</li> : null}
              {info.buddhistFlags.isDayZhaiShuoWang ? <li>{t('calZhaiShuoWang')}</li> : null}
              {info.buddhistFlags.isDayZhaiSix ? <li>{t('calZhaiSix')}</li> : null}
              {info.buddhistFlags.isDayZhaiTen ? <li>{t('calZhaiTen')}</li> : null}
              {info.buddhistFlags.isDayZhaiGuanYin ? <li>{t('calZhaiGuanYin')}</li> : null}
            </ul>
            <p className="cal__fine">{t('calBuddhistNote')}</p>
          </div>
        </motion.section>
      )}

      {fotoOther.length > 0 ? (
        <motion.section
          className="cal__section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.1 }}
        >
          <h3 className="cal__h">{t('calOtherFestTitle')}</h3>
          <ul className="cal__plain-list">
            {fotoOther.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      <div className="cal__split">
        <motion.section
          className="cal__card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.11 }}
        >
          <h3 className="cal__h">{t('calGanZhiTitle')}</h3>
          <dl className="cal__dl">
            <div>
              <dt>{t('calYearPillar')}</dt>
              <dd>{info.pillars.year}</dd>
            </div>
            <div>
              <dt>{t('calMonthPillar')}</dt>
              <dd>{info.pillars.month}</dd>
            </div>
            <div>
              <dt>{t('calDayPillar')}</dt>
              <dd>{info.pillars.day}</dd>
            </div>
          </dl>
        </motion.section>

        <motion.section
          className="cal__card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.13 }}
        >
          <h3 className="cal__h">{t('calNineStarTitle')}</h3>
          <p className="cal__nine-main">
            <span className="cal__nine-num">{info.nineStar.number}</span>
            <span>{info.nineStar.nameBeiDou}</span>
          </p>
          <p className="cal__muted">
            {info.nineStar.nameXuanKong} · {info.nineStar.wuXing} · {info.nineStar.color}
          </p>
          <p className="cal__muted">
            {t('calNinePosition')}: {info.nineStar.position} — {info.nineStar.luckQiMen}
            {info.nineStar.luckXuanKong ? (
              <>
                {' '}
                · {info.nineStar.luckXuanKong}
              </>
            ) : null}
          </p>
        </motion.section>
      </div>

      <motion.section
        className="cal__card cal__card--wide"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.14 }}
      >
        <h3 className="cal__h">{t('calConstellationTitle')}</h3>
        <p className="cal__xiu-row">
          <strong>{info.foto.xiu}</strong>
          <span className="cal__muted"> · {info.foto.xiuLuck}</span>
        </p>
        <p className="cal__muted">
          {t('calShou')}: {info.foto.shou} · {t('calGong')}: {info.foto.gong} · {t('calZheng')}:{' '}
          {info.foto.zheng}
        </p>
      </motion.section>

      <motion.section
        className="cal__card cal__card--wide"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.15 }}
      >
        <h3 className="cal__h">{t('calYiJiTitle')}</h3>
        <div className="cal__yi-ji">
          <div>
            <h4 className="cal__subh">{t('calYi')}</h4>
            <ul className="cal__pill-list">
              {info.yi.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="cal__subh">{t('calJi')}</h4>
            <ul className="cal__pill-list cal__pill-list--ji">
              {info.ji.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="cal__card cal__card--wide"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.16 }}
      >
        <h3 className="cal__h">{t('calFengShuiTitle')}</h3>
        <p className="cal__fine">{t('calFengShuiLead')}</p>
        <ul className="cal__pos-list">
          <li>
            <span className="cal__pos-k">{t('calPosXi')}</span>
            <span>{info.positions.xi}</span>
          </li>
          <li>
            <span className="cal__pos-k">{t('calPosFu')}</span>
            <span>{info.positions.fu}</span>
          </li>
          <li>
            <span className="cal__pos-k">{t('calPosCai')}</span>
            <span>{info.positions.cai}</span>
          </li>
          <li>
            <span className="cal__pos-k">{t('calPosYangGui')}</span>
            <span>{info.positions.yangGui}</span>
          </li>
          <li>
            <span className="cal__pos-k">{t('calPosYinGui')}</span>
            <span>{info.positions.yinGui}</span>
          </li>
        </ul>
      </motion.section>

      <motion.section
        className="cal__section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.17 }}
      >
        <h3 className="cal__h">{t('calZodiacTitle')}</h3>
        <p className="cal__fine">{t('calZodiacLead')}</p>
        <div className="cal__zodiac-grid">
          {ZODIAC_EMOJI.map((emoji, i) => (
            <div key={i} className="cal__z-card">
              <span className="cal__z-emoji" aria-hidden="true">
                {emoji}
              </span>
              <span className="cal__z-name">{t(`zodiac${i}`)}</span>
              <p className="cal__z-line">{getZodiacDailyLine(i, anchorDate, locale)}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <p className="cal__disclaimer">{t('calDisclaimer')}</p>
    </div>
  )
}
