/**
 * Gom dữ liệu lịch âm–dương, lễ, Phật giáo (thư viện lunar-javascript / Foto), phong thủy cơ bản.
 * I18n của thư viện: chs (mặc định) hoặc en — giao diện Việt dùng chs + nhãn tiếng Việt.
 */
import { Solar, Foto, I18n } from 'lunar-javascript'
import { ganZhiToEn, ganZhiToVi } from './calendar/ganZhi.js'
import {
  localizeFoto,
  localizeJieQi,
  localizeNineStar,
  localizePositions,
  localizeYiJi,
} from './calendar/localizeDisplay.js'

const SHENG_XIAO_ORDER = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

/** Chuẩn hóa tên lễ từ Foto.getFestivals() */
function festivalName(f) {
  if (f == null) return ''
  if (typeof f === 'string') return f
  if (typeof f.getName === 'function') return f.getName()
  return String(f)
}

function normFotoList(arr) {
  if (!arr?.length) return []
  return arr.map(festivalName).filter(Boolean)
}

/**
 * Lễ Việt Nam (một phần) — dương cố định + âm (tháng không nhuận; rằm/mồng dùng giá trị tuyệt đối tháng)
 */
function vietnamSolarHolidays(month, day) {
  const key = `${month}-${day}`
  const map = {
    '1-1': { vi: 'Tết Dương lịch', en: 'New Year' },
    '4-30': { vi: 'Giải phóng miền Nam, thống nhất đất nước', en: 'Reunification Day' },
    '5-1': { vi: 'Ngày Quốc tế Lao động', en: 'International Labour Day' },
    '9-2': { vi: 'Quốc khánh', en: 'National Day' },
    '9-3': { vi: 'Nghỉ Quốc khánh (thường gặp)', en: 'National Day (observed)' },
  }
  return map[key] || null
}

function vietnamLunarHolidays(lunarMonthAbs, lunarDay) {
  const key = `${lunarMonthAbs}-${lunarDay}`
  const map = {
    '1-1': { vi: 'Tết Nguyên Đán', en: 'Lunar New Year' },
    '1-2': { vi: 'Mùng 2 Tết', en: 'Lunar New Year (day 2)' },
    '1-3': { vi: 'Mùng 3 Tết', en: 'Lunar New Year (day 3)' },
    '1-15': { vi: 'Tết Nguyên tiêu (Rằm tháng Giêng)', en: 'First Full Moon Festival' },
    '3-10': { vi: 'Giỗ tổ Hùng Vương', en: 'Hung Kings Commemoration' },
    '4-15': { vi: 'Lễ Phật đản (Rằm tháng Tư)', en: 'Vesak / Buddha’s Birthday' },
    '5-5': { vi: 'Tết Đoan ngọ', en: 'Mid-year festival' },
    '7-15': { vi: 'Vu Lan (Rằm tháng Bảy)', en: 'Vu Lan / Ullambana' },
    '8-15': { vi: 'Tết Trung thu', en: 'Mid-Autumn Festival' },
    '12-23': { vi: 'Ông Táo chầu trời', en: 'Kitchen God day' },
  }
  return map[key] || null
}

/** Tháng âm — tên gọi thông dụng (Việt) */
const LUNAR_MONTH_VI = [
  '',
  'Giêng',
  'Hai',
  'Ba',
  'Tư',
  'Năm',
  'Sáu',
  'Bảy',
  'Tám',
  'Chín',
  'Mười',
  'Mười một',
  'Chạp',
]

const LUNAR_MONTH_EN = [
  '',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
]

const GAN_VI = {
  甲: 'Giáp',
  乙: 'Ất',
  丙: 'Bính',
  丁: 'Đinh',
  戊: 'Mậu',
  己: 'Kỷ',
  庚: 'Canh',
  辛: 'Tân',
  壬: 'Nhâm',
  癸: 'Quý',
}

const ZHI_VI = {
  子: 'Tý',
  丑: 'Sửu',
  寅: 'Dần',
  卯: 'Mão',
  辰: 'Thìn',
  巳: 'Tỵ',
  午: 'Ngọ',
  未: 'Mùi',
  申: 'Thân',
  酉: 'Dậu',
  戌: 'Tuất',
  亥: 'Hợi',
}

const GAN_EN = {
  甲: 'Jia',
  乙: 'Yi',
  丙: 'Bing',
  丁: 'Ding',
  戊: 'Wu',
  己: 'Ji',
  庚: 'Geng',
  辛: 'Xin',
  壬: 'Ren',
  癸: 'Gui',
}

const ZHI_EN = {
  子: 'Zi',
  丑: 'Chou',
  寅: 'Yin',
  卯: 'Mao',
  辰: 'Chen',
  巳: 'Si',
  午: 'Wu',
  未: 'Wei',
  申: 'Shen',
  酉: 'You',
  戌: 'Xu',
  亥: 'Hai',
}

const SHENG_VI_SHORT = {
  鼠: 'Tý',
  牛: 'Sửu',
  虎: 'Dần',
  兔: 'Mão',
  龙: 'Thìn',
  蛇: 'Tỵ',
  马: 'Ngọ',
  羊: 'Mùi',
  猴: 'Thân',
  鸡: 'Dậu',
  狗: 'Tuất',
  猪: 'Hợi',
}

/** Tên con vật — dễ đọc hơn chỉ "tuổi Tý"... */
const SHENG_VI_ANIMAL = {
  鼠: 'Chuột',
  牛: 'Trâu',
  虎: 'Hổ',
  兔: 'Mèo',
  龙: 'Rồng',
  蛇: 'Rắn',
  马: 'Ngựa',
  羊: 'Dê',
  猴: 'Khỉ',
  鸡: 'Gà',
  狗: 'Chó',
  猪: 'Lợn',
}

const SHENG_EN_ANIMAL = {
  鼠: 'Rat',
  牛: 'Ox',
  虎: 'Tiger',
  兔: 'Rabbit',
  龙: 'Dragon',
  蛇: 'Snake',
  马: 'Horse',
  羊: 'Goat',
  猴: 'Monkey',
  鸡: 'Rooster',
  狗: 'Dog',
  猪: 'Pig',
}

/**
 * Dòng âm lịch đọc được (không chỉ chữ Hán) + một dòng đối chiếu Hán.
 */
export function buildLunarHumanLines(lunar) {
  const m = lunar.month
  const monthVi = LUNAR_MONTH_VI[m] || `tháng ${m}`
  const monthEn = LUNAR_MONTH_EN[m] || String(m)
  const leapVi = lunar.isLeapMonth ? ' (tháng nhuận)' : ''
  const leapEn = lunar.isLeapMonth ? ' (leap month)' : ''
  const yVi = ganZhiToVi(lunar.yearInGanZhi)
  const dVi = ganZhiToVi(lunar.dayInGanZhi)
  const moVi = ganZhiToVi(lunar.monthInGanZhi)
  const animal = SHENG_EN_ANIMAL[lunar.shengxiao] || lunar.shengxiao
  const con = SHENG_VI_ANIMAL[lunar.shengxiao] || SHENG_VI_SHORT[lunar.shengxiao] || lunar.shengxiao

  const primaryVi = `Ngày ${lunar.day} tháng ${monthVi} âm lịch${leapVi}. Năm ${yVi} (năm con ${con}). Can chi tháng: ${moVi}. Can chi ngày: ${dVi}.`

  const primaryEn = `Lunar: ${monthEn} month, day ${lunar.day}${leapEn}. Year ${ganZhiToEn(lunar.yearInGanZhi)} (Year of the ${animal}). Month pillar: ${ganZhiToEn(lunar.monthInGanZhi)}. Day pillar: ${ganZhiToEn(lunar.dayInGanZhi)}.`

  const hanLine = `${lunar.monthInChinese}月${lunar.dayInChinese} · ${lunar.yearInGanZhi}年 · ${lunar.dayInGanZhi}日`

  return { primaryVi, primaryEn, hanLine }
}

export function buildLunarDayInfo(date, locale) {
  const solar = Solar.fromDate(date)

  I18n.setLanguage('chs')
  const lunarZh = solar.getLunar()
  /** Phải đọc khi I18n là chs: sau setLanguage('en'), getYearInGanZhi() trả pinyin Latin → ganZhiToVi sai; getYearShengXiao() thành "Horse"... */
  const yearGZ = lunarZh.getYearInGanZhi()
  const monthGZ = lunarZh.getMonthInGanZhi()
  const dayGZ = lunarZh.getDayInGanZhi()
  const shengxiao = lunarZh.getYearShengXiao()
  const monthInChinese = lunarZh.getMonthInChinese()
  const dayInChinese = lunarZh.getDayInChinese()
  const jieQiZh = lunarZh.getJieQi()

  const fotoZh = Foto.fromLunar(lunarZh)
  const nineZh = lunarZh.getDayNineStar()
  const yiZh = lunarZh.getDayYi() || []
  const jiZh = lunarZh.getDayJi() || []
  const posZh = {
    xi: lunarZh.getDayPositionXi(),
    xiDesc: lunarZh.getDayPositionXiDesc(),
    fu: lunarZh.getDayPositionFu(1),
    fuDesc: lunarZh.getDayPositionFuDesc(1),
    cai: lunarZh.getDayPositionCai(),
    caiDesc: lunarZh.getDayPositionCaiDesc(),
    yangGui: lunarZh.getDayPositionYangGui(),
    yangGuiDesc: lunarZh.getDayPositionYangGuiDesc(),
    yinGui: lunarZh.getDayPositionYinGui(),
    yinGuiDesc: lunarZh.getDayPositionYinGuiDesc(),
  }

  I18n.setLanguage('en')
  const lunarEn = solar.getLunar()
  const fotoEn = Foto.fromLunar(lunarEn)
  const nineEn = lunarEn.getDayNineStar()
  const posEn = {
    xi: lunarEn.getDayPositionXi(),
    xiDesc: lunarEn.getDayPositionXiDesc(),
    fu: lunarEn.getDayPositionFu(1),
    fuDesc: lunarEn.getDayPositionFuDesc(1),
    cai: lunarEn.getDayPositionCai(),
    caiDesc: lunarEn.getDayPositionCaiDesc(),
    yangGui: lunarEn.getDayPositionYangGui(),
    yangGuiDesc: lunarEn.getDayPositionYangGuiDesc(),
    yinGui: lunarEn.getDayPositionYinGui(),
    yinGuiDesc: lunarEn.getDayPositionYinGuiDesc(),
  }

  const jieQiEn = lunarEn.getJieQi()

  const y = solar.getYear()
  const month = solar.getMonth()
  const day = solar.getDay()

  const lunarMonthRaw = lunarZh.getMonth()
  const lunarMonthAbs = Math.abs(lunarMonthRaw)
  const isLeapMonth = lunarMonthRaw < 0

  const zodiacIndex = Math.max(0, SHENG_XIAO_ORDER.indexOf(shengxiao))

  const festivalsFotoZh = normFotoList(fotoZh.getFestivals())
  const festivalsFotoEn = normFotoList(fotoEn.getFestivals())
  const otherBuddhistZh = fotoZh.getOtherFestivals() || []
  const otherBuddhistEn = normFotoList(fotoEn.getOtherFestivals() || [])
  const nameEnByZh = Object.fromEntries([
    ...festivalsFotoZh.map((z, i) => [z, festivalsFotoEn[i] ?? '']),
    ...otherBuddhistZh.map((z, i) => [z, otherBuddhistEn[i] ?? '']),
  ])

  const vnSolar = vietnamSolarHolidays(month, day)
  const vnLunar = vietnamLunarHolidays(lunarMonthAbs, lunarZh.getDay())

  const holidays = []
  if (vnSolar) holidays.push({ kind: 'vn_solar', ...vnSolar })
  if (vnLunar) holidays.push({ kind: 'vn_lunar', ...vnLunar })

  const gzLine = locale === 'en' ? ganZhiToEn : ganZhiToVi

  const buddhistFlags = {
    isMonthZhai: fotoZh.isMonthZhai(),
    isDayZhaiShuoWang: fotoZh.isDayZhaiShuoWang(),
    isDayZhaiSix: fotoZh.isDayZhaiSix(),
    isDayZhaiTen: fotoZh.isDayZhaiTen(),
    isDayZhaiGuanYin: fotoZh.isDayZhaiGuanYin(),
  }

  const lunarSlice = {
    month: lunarMonthAbs,
    day: lunarZh.getDay(),
    isLeapMonth,
    monthInChinese,
    dayInChinese,
    yearInGanZhi: yearGZ,
    monthInGanZhi: monthGZ,
    dayInGanZhi: dayGZ,
    shengxiao,
  }

  return {
    solar: { y, month, day },
    lunar: {
      month: lunarMonthAbs,
      day: lunarZh.getDay(),
      isLeapMonth,
      monthInChinese,
      dayInChinese,
      yearInGanZhi: yearGZ,
      monthInGanZhi: monthGZ,
      dayInGanZhi: dayGZ,
      shengxiao,
      zodiacIndex,
      ...buildLunarHumanLines(lunarSlice),
    },
    pillars: {
      year: gzLine(yearGZ),
      month: gzLine(monthGZ),
      day: gzLine(dayGZ),
    },
    jieQiToday: jieQiZh ? localizeJieQi(jieQiZh, locale, jieQiEn) : null,
    foto: {
      festivalsZh: festivalsFotoZh,
      otherFestivalsZh: otherBuddhistZh,
      nameEnByZh,
      ...localizeFoto(fotoZh, fotoEn, locale),
    },
    holidays,
    yi: localizeYiJi(yiZh.slice(0, 8), locale),
    ji: localizeYiJi(jiZh.slice(0, 8), locale),
    nineStar: localizeNineStar(nineZh, nineEn, locale),
    positions: localizePositions(posZh, posEn, locale),
    buddhistFlags,
  }
}

export function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function hashPick(seed, modulo) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % modulo
}
