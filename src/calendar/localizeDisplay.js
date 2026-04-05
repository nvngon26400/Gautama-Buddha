/**
 * Chuỗi hiển thị theo locale — không để chữ Hán trên giao diện.
 * - en: dùng trực tiếp đầu ra tiếng Anh của lunar-javascript (I18n en).
 * - vi: bản dịch tiếng Việt; thiếu mục thì fallback sang tiếng Anh (không dùng chữ Hán).
 */
import yjPairs from './yj-pairs.json'
import {
  BAGUA_ZH,
  COLOR_ZH,
  DIR_ZH,
  FOTO_FEST_ZH,
  GONG_ZH,
  LUCK_QIMEN_ZH,
  LUCK_XUANKONG_ZH,
  NINE_BEIDOU_ZH,
  NINE_XUANKONG_ZH,
  SHOU_ZH,
  WUXING_ZH,
  XIU_LUCK_ZH,
  XIU_ONE_ZH,
  ZHENG_ZH,
  translateJieQi,
  term,
} from './calendarTerms.js'
import { ganZhiToEn, ganZhiToVi } from './ganZhi.js'

const ZH_TO_EN_YIJI = Object.fromEntries(Object.values(yjPairs).map((v) => [v.zh, v.en]))

/** Hoàng lịch Nên/Kiêng — tiếng Việt (bổ sung dần; thiếu → tiếng Anh) */
export const YIJI_VI = {
  祭祀: 'Tế tự (cúng bái)',
  祈福: 'Cầu phúc',
  求嗣: 'Cầu con',
  开光: 'Khai quang (cúng tượng, vật phẩm)',
  塑绘: 'Tạo tượng, vẽ',
  齐醮: 'Lễ trai giới (Tề tế)',
  斋醮: 'Trai tế',
  沐浴: 'Tắm gội (tịnh thân)',
  酬神: 'Tạ ơn thần linh',
  造庙: 'Dựng miếu',
  祀灶: 'Cúng Táo quân',
  焚香: 'Thắp hương',
  谢土: 'Tạ đất',
  出火: 'Xuất hỏa (dời bếp)',
  雕刻: 'Chạm khắc',
  嫁娶: 'Cưới gả',
  订婚: 'Đính hôn',
  纳采: 'Nạp thái (đặt hôn)',
  问名: 'Hỏi tên (lễ)',
  纳婿: 'Rể vào nhà vợ',
  归宁: 'Về thăm nhà mẹ đẻ',
  安床: 'An giường',
  合帐: 'Dựng màn',
  冠笄: 'Lễ thành niên (đội mũ, cài trâm)',
  订盟: 'Kết minh',
  进人口: 'Nhận nuôi, thêm người trong nhà',
  裁衣: 'May vá',
  挽面: 'Tỉa lông mặt (lễ)',
  开容: 'Khai dung',
  修坟: 'Sửa mộ',
  启钻: 'Mở quan tài (an táng)',
  破土: 'Phá thổ (đào đất)',
  安葬: 'An táng',
  立碑: 'Dựng bia',
  成服: 'Mặc tang phục',
  除服: 'Bỏ tang phục',
  开生坟: 'Đào mả trước',
  合寿木: 'Đóng quan tài',
  入殓: 'Nhập liệm',
  移柩: 'Dời quan tài',
  普渡: 'Cúng cô hồn',
  入宅: 'Nhập trạch (vào nhà mới)',
  安香: 'An bàn thờ, bát hương',
  安门: 'Lắp cửa',
  修造: 'Tu sửa, xây dựng',
  起基: 'Khởi nền',
  动土: 'Động thổ',
  上梁: 'Thượng lương (dựng kèo)',
  竖柱: 'Dựng cột',
  开井开池: 'Đào giếng, ao',
  作陂放水: 'Làm đập, dẫn nước',
  拆卸: 'Tháo dỡ',
  破屋: 'Phá nhà cũ',
  坏垣: 'Phá tường',
  补垣: 'Vá tường',
  伐木做梁: 'Chặt gỗ làm xà',
  作灶: 'Làm bếp',
  解除: 'Giải trừ (thỉnh cầu)',
  开柱眼: 'Khoét mộng cột',
  穿屏扇架: 'Lắp vách, cửa',
  盖屋合脊: 'Lợp nhà, nối nóc',
  开厕: 'Làm nhà vệ sinh',
  造仓: 'Dựng kho',
  塞穴: 'Bịt hố',
  平治道涂: 'San đường',
  造桥: 'Làm cầu',
  作厕: 'Làm nhà xí',
  筑堤: 'Đắp đê',
  开池: 'Đào ao',
  伐木: 'Chặt cây',
  开渠: 'Đào mương',
  掘井: 'Đào giếng',
  扫舍: 'Quét dọn nhà',
  放水: 'Tháo nước',
  造屋: 'Dựng nhà',
  合脊: 'Nối nóc nhà',
  造畜稠: 'Dựng chuồng gia súc',
  修门: 'Sửa cửa',
  定磉: 'Đặt chân tường',
  作梁: 'Dựng xà',
  修饰垣墙: 'Trát, sơn tường',
  架马: 'Lắp giàn giáo',
  开市: 'Khai trương',
  挂匾: 'Treo biển hiệu',
  纳财: 'Thu tài, nhận tiền',
  求财: 'Cầu tài',
  开仓: 'Mở kho',
  买车: 'Mua xe',
  置产: 'Tậu sản',
  雇佣: 'Thuê người',
  出货财: 'Xuất hàng, giao tiền',
  安机械: 'Lắp máy móc',
  造车器: 'Chế tạo xe, cối',
  经络: 'Dệt vải',
  酝酿: 'Ủ men, ủ rượu',
  作染: 'Nhuộm',
  鼓铸: 'Đúc đồng',
  造船: 'Đóng tàu',
  割蜜: 'Lấy mật ong',
  栽种: 'Trồng cây',
  取渔: 'Đánh cá',
  结网: 'Đan lưới',
  牧养: 'Chăn nuôi',
  安碓磑: 'Lắp cối xay',
  习艺: 'Học nghề',
  入学: 'Nhập học',
  理发: 'Cắt tóc',
  探病: 'Thăm bệnh',
  见贵: 'Gặp quý nhân',
  乘船: 'Đi thuyền',
  渡水: 'Qua sông',
  针灸: 'Châm cứu',
  出行: 'Xuất hành',
  移徙: 'Chuyển chỗ ở',
  分居: 'Tách hộ',
  剃头: 'Cạo đầu',
  整手足甲: 'Sửa móng tay chân',
  纳畜: 'Mua súc vật',
  捕捉: 'Bắt giữ',
  畋猎: 'Săn bắn',
  教牛马: 'Dạy dỗ súc vật',
  会亲友: 'Họp bạn bè, họ hàng',
  赴任: 'Nhậm chức',
  求医: 'Khám bệnh',
  治病: 'Chữa bệnh',
  词讼: 'Kiện tụng',
  起基动土: 'Khởi nền, động thổ',
  破屋坏垣: 'Phá nhà, tường',
  盖屋: 'Lợp nhà',
  造仓库: 'Dựng kho',
  立券交易: 'Ký giao kèo, giao dịch',
  交易: 'Giao dịch, buôn bán',
  立券: 'Lập giao kèo',
  安机: 'Lắp máy',
  会友: 'Gặp bạn',
  求医疗病: 'Cầu thuốc, chữa bệnh',
  诸事不宜: 'Mọi việc không nên làm',
  馀事勿取: 'Việc khác không nên',
  行丧: 'Đưa tang',
  断蚁: 'Diệt kiến (lễ)',
  归岫: 'Thu dọn (lễ)',
}

export function localizeYiJi(zhList, locale) {
  if (locale === 'en') return zhList.map((zh) => ZH_TO_EN_YIJI[zh] || zh)
  return zhList.map((zh) => YIJI_VI[zh] || ZH_TO_EN_YIJI[zh] || zh)
}

export function localizeJieQi(zh, locale, enFallback) {
  if (!zh) return ''
  return translateJieQi(zh, locale, enFallback)
}

export function localizeNineStar(nineZh, nineEn, locale) {
  const bd = nineZh.getNameInBeiDou()
  const xk = nineZh.getNameInXuanKong()
  const wx = nineZh.getWuXing()
  const col = nineZh.getColor()
  const posZh = nineZh.getPosition()
  const luckQm = nineZh.getLuckInQiMen()
  const luckXk = nineEn.getLuckInXuanKong()

  return {
    number: nineEn.getNumber(),
    nameBeiDou: term(NINE_BEIDOU_ZH, bd, locale, nineEn.getNameInBeiDou()),
    nameXuanKong: term(NINE_XUANKONG_ZH, xk, locale, nineEn.getNameInXuanKong()),
    wuXing: term(WUXING_ZH, wx, locale, nineEn.getWuXing()),
    color: term(COLOR_ZH, col, locale, nineEn.getColor()),
    position: locale === 'en' ? nineEn.getPosition() : term(BAGUA_ZH, posZh, locale, nineEn.getPosition()),
    luckQiMen: term(LUCK_QIMEN_ZH, luckQm, locale, luckQm),
    luckXuanKong: luckXk,
  }
}

export function localizeFoto(fotoZh, fotoEn, locale) {
  if (locale === 'en') {
    return {
      xiu: fotoEn.getXiu(),
      xiuLuck: fotoEn.getXiuLuck(),
      shou: fotoEn.getShou(),
      gong: fotoEn.getGong(),
      zheng: fotoEn.getZheng(),
    }
  }
  const x = fotoZh.getXiu()
  const luck = fotoZh.getXiuLuck()
  return {
    xiu: term(XIU_ONE_ZH, x, 'vi', fotoEn.getXiu()),
    xiuLuck: term(XIU_LUCK_ZH, luck, 'vi', fotoEn.getXiuLuck()),
    shou: term(SHOU_ZH, fotoZh.getShou(), 'vi', fotoEn.getShou()),
    gong: term(GONG_ZH, fotoZh.getGong(), 'vi', fotoEn.getGong()),
    zheng: term(ZHENG_ZH, fotoZh.getZheng(), 'vi', fotoEn.getZheng()),
  }
}

export function localizePositions(posZh, posEn, locale) {
  const keys = ['xi', 'fu', 'cai', 'yangGui', 'yinGui']
  const out = {}
  for (const k of keys) {
    const dirKey = `${k}Desc`
    if (locale === 'en') {
      out[k] = `${posEn[k]} — ${posEn[dirKey]}`
    } else {
      out[k] = `${term(BAGUA_ZH, posZh[k], locale, posZh[k])} — ${term(DIR_ZH, posZh[dirKey], locale, posZh[dirKey])}`
    }
  }
  return out
}

export function localizeFestivalName(zh, locale, enFallback) {
  const row = FOTO_FEST_ZH[zh]
  if (row) return locale === 'en' ? row.en : row.vi
  if (locale === 'en') return enFallback ?? zh
  return enFallback ?? zh
}

export { ganZhiToEn, ganZhiToVi }
