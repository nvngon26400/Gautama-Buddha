/**
 * Bản dịch tham khảo cho lịch cổ (tiếng Việt / tiếng Anh).
 * Tiếng Anh: ưu tiên chuỗi từ lunar-javascript (I18n en) khi gọi từ buildLunarDayInfo.
 */

/** 24 tiết khí */
export const JIEQI_ZH = {
  立春: { vi: 'Lập xuân', en: 'Lichun (Start of Spring)' },
  雨水: { vi: 'Vũ thủy', en: 'Rain Water' },
  惊蛰: { vi: 'Kinh trập', en: 'Awakening of Insects' },
  春分: { vi: 'Xuân phân', en: 'Spring Equinox' },
  清明: { vi: 'Thanh minh', en: 'Qingming (Clear & Bright)' },
  谷雨: { vi: 'Cốc vũ', en: 'Grain Rain' },
  立夏: { vi: 'Lập hạ', en: 'Start of Summer' },
  小满: { vi: 'Tiểu mãn', en: 'Grain Buds' },
  芒种: { vi: 'Mang chủng', en: 'Grain in Ear' },
  夏至: { vi: 'Hạ chí', en: 'Summer Solstice' },
  小暑: { vi: 'Tiểu thử', en: 'Minor Heat' },
  大暑: { vi: 'Đại thử', en: 'Major Heat' },
  立秋: { vi: 'Lập thu', en: 'Start of Autumn' },
  处暑: { vi: 'Xử thử', en: 'End of Heat' },
  白露: { vi: 'Bạch lộ', en: 'White Dew' },
  秋分: { vi: 'Thu phân', en: 'Autumn Equinox' },
  寒露: { vi: 'Hàn lộ', en: 'Cold Dew' },
  霜降: { vi: 'Sương giáng', en: "Frost's Descent" },
  立冬: { vi: 'Lập đông', en: 'Start of Winter' },
  小雪: { vi: 'Tiểu tuyết', en: 'Minor Snow' },
  大雪: { vi: 'Đại tuyết', en: 'Major Snow' },
  冬至: { vi: 'Đông chí', en: 'Winter Solstice' },
  小寒: { vi: 'Tiểu hàn', en: 'Minor Cold' },
  大寒: { vi: 'Đại hàn', en: 'Major Cold' },
}

/** Bắc Đẩu / Cửu tinh (tên Hán trong thư viện) */
export const NINE_BEIDOU_ZH = {
  天枢: { vi: 'Thiên Xu (Đới quân)', en: 'Dubhe' },
  天璇: { vi: 'Thiên Tuyền (Chức đình)', en: 'Merak' },
  天玑: { vi: 'Thiên Cơ (Thực tài)', en: 'Phecda' },
  天权: { vi: 'Thiên Quyền (Pháp tài)', en: 'Megrez' },
  玉衡: { vi: 'Ngọc Hành (Văn xương)', en: 'Alioth' },
  开阳: { vi: 'Khai Dương (Tả phụ)', en: 'Mizar' },
  摇光: { vi: 'Dao Quang (Hữu bật)', en: 'Alkaid (Yaoguang)' },
  洞明: { vi: 'Động Minh', en: 'Dongming' },
  隐元: { vi: 'Ẩn Nguyên', en: 'Yinyuan' },
}

export const NINE_XUANKONG_ZH = {
  贪狼: { vi: 'Tham Lang', en: 'Greedy Wolf' },
  巨门: { vi: 'Cự Môn', en: 'Great Gate' },
  禄存: { vi: 'Lộc Tồn', en: 'Salary' },
  文曲: { vi: 'Văn Khúc', en: 'Literary Arts' },
  廉贞: { vi: 'Liêm Trinh', en: 'Chastity' },
  武曲: { vi: 'Vũ Khúc', en: 'Military Arts' },
  破军: { vi: 'Phá Quân', en: 'Broken Army' },
  左辅: { vi: 'Tả Phụ', en: 'Left Assistant' },
  右弼: { vi: 'Hữu Bật', en: 'Right Assistant' },
}

export const LUCK_QIMEN_ZH = {
  大凶: { vi: 'Đại hung', en: 'Very inauspicious' },
  小凶: { vi: 'Tiểu hung', en: 'Minor inauspicious' },
  大吉: { vi: 'Đại cát', en: 'Very auspicious' },
  小吉: { vi: 'Tiểu cát', en: 'Minor auspicious' },
}

/** Cửu tinh — cát/hung huyền không (thư viện trả 吉 / 凶) */
export const LUCK_XUANKONG_ZH = {
  吉: { vi: 'Cát', en: 'Auspicious' },
  凶: { vi: 'Hung', en: 'Inauspicious' },
}

export const WUXING_ZH = {
  金: { vi: 'Kim (Kim)', en: 'Metal' },
  木: { vi: 'Mộc (Gỗ)', en: 'Wood' },
  水: { vi: 'Thủy (Nước)', en: 'Water' },
  火: { vi: 'Hỏa (Lửa)', en: 'Fire' },
  土: { vi: 'Thổ (Đất)', en: 'Earth' },
}

export const COLOR_ZH = {
  赤: { vi: 'Đỏ', en: 'Red' },
  碧: { vi: 'Xanh ngọc', en: 'Green jade' },
  绿: { vi: 'Lục', en: 'Green' },
  黄: { vi: 'Vàng', en: 'Yellow' },
  白: { vi: 'Trắng', en: 'White' },
  黑: { vi: 'Đen', en: 'Black' },
}

/** Bát quái + hướng (phần chữ Hán từ thư viện khi chs) */
export const BAGUA_ZH = {
  乾: { vi: 'Càn (Trời)', en: 'Qian (Heaven)' },
  坤: { vi: 'Khôn (Đất)', en: 'Kun (Earth)' },
  震: { vi: 'Chấn (Sấm)', en: 'Zhen (Thunder)' },
  巽: { vi: 'Tốn (Gió)', en: 'Xun (Wind)' },
  坎: { vi: 'Khảm (Nước)', en: 'Kan (Water)' },
  离: { vi: 'Ly (Lửa)', en: 'Li (Fire)' },
  艮: { vi: 'Cấn (Núi)', en: 'Gen (Mountain)' },
  兑: { vi: 'Đoài (Đầm)', en: 'Dui (Lake)' },
}

export const DIR_ZH = {
  正北: { vi: 'chính Bắc', en: 'due North' },
  正南: { vi: 'chính Nam', en: 'due South' },
  正东: { vi: 'chính Đông', en: 'due East' },
  正西: { vi: 'chính Tây', en: 'due West' },
  东北: { vi: 'Đông Bắc', en: 'Northeast' },
  东南: { vi: 'Đông Nam', en: 'Southeast' },
  西南: { vi: 'Tây Nam', en: 'Southwest' },
  西北: { vi: 'Tây Bắc', en: 'Northwest' },
  中: { vi: 'Trung ương', en: 'Center' },
}

/** Nhị thập bát tú — chữ một ký tự */
export const XIU_ONE_ZH = {
  角: { vi: 'Giác', en: 'Horn' },
  亢: { vi: 'Kháng', en: 'Neck' },
  氐: { vi: 'Để', en: 'Root' },
  房: { vi: 'Phòng', en: 'Room' },
  心: { vi: 'Tâm', en: 'Heart' },
  尾: { vi: 'Vĩ', en: 'Tail' },
  箕: { vi: 'Ki', en: 'Winnowing basket' },
  斗: { vi: 'Đẩu', en: 'Dipper' },
  牛: { vi: 'Ngưu', en: 'Ox' },
  女: { vi: 'Nữ', en: 'Girl' },
  虚: { vi: 'Hư', en: 'Emptiness' },
  危: { vi: 'Nguy', en: 'Rooftop' },
  室: { vi: 'Thất', en: 'House' },
  壁: { vi: 'Bích', en: 'Wall' },
  奎: { vi: 'Khuê', en: 'Stride' },
  娄: { vi: 'Lâu', en: 'Bond' },
  胃: { vi: 'Vị', en: 'Stomach' },
  昴: { vi: 'Mão', en: 'Hairy head' },
  毕: { vi: 'Tất', en: 'Net' },
  觜: { vi: 'Tủy', en: 'Turtle beak' },
  参: { vi: 'Tham', en: 'Triplet' },
  井: { vi: 'Tỉnh', en: 'Well' },
  鬼: { vi: 'Quỷ', en: 'Ghost' },
  柳: { vi: 'Liễu', en: 'Willow' },
  星: { vi: 'Tinh', en: 'Star' },
  张: { vi: 'Trương', en: 'Extended net' },
  翼: { vi: 'Dực', en: 'Wing' },
  轸: { vi: 'Chẩn', en: 'Chariot' },
}

export const XIU_LUCK_ZH = {
  吉: { vi: 'Cát (lành)', en: 'Auspicious' },
  凶: { vi: 'Hung (dữ)', en: 'Inauspicious' },
  半吉: { vi: 'Bán cát', en: 'Half auspicious' },
}

export const SHOU_ZH = {
  青龙: { vi: 'Thanh Long', en: 'Azure Dragon' },
  明堂: { vi: 'Minh Đường', en: 'Bright Hall' },
  天刑: { vi: 'Thiên Hình', en: 'Heavenly Punishment' },
  朱雀: { vi: 'Chu Tước', en: 'Vermilion Bird' },
  金匮: { vi: 'Kim Quỹ', en: 'Golden Lock' },
  天德: { vi: 'Thiên Đức', en: 'Heavenly Virtue' },
  白虎: { vi: 'Bạch Hổ', en: 'White Tiger' },
  玉堂: { vi: 'Ngọc Đường', en: 'Jade Hall' },
  天牢: { vi: 'Thiên Lao', en: 'Heavenly Prison' },
  玄武: { vi: 'Huyền Vũ', en: 'Black Tortoise' },
  司命: { vi: 'Tư Mệnh', en: 'Controller of Fate' },
  勾陈: { vi: 'Câu Trần', en: 'Hooked Array' },
}

export const GONG_ZH = {
  东: { vi: 'Đông', en: 'East' },
  南: { vi: 'Nam', en: 'South' },
  西: { vi: 'Tây', en: 'West' },
  北: { vi: 'Bắc', en: 'North' },
  中: { vi: 'Trung', en: 'Center' },
}

export const ZHENG_ZH = {
  日: { vi: 'Nhật (Mặt trời)', en: 'Sun' },
  月: { vi: 'Nguyệt (Mặt trăng)', en: 'Moon' },
  金: { vi: 'Kim', en: 'Metal' },
  木: { vi: 'Mộc', en: 'Wood' },
  水: { vi: 'Thủy', en: 'Water' },
  火: { vi: 'Hỏa', en: 'Fire' },
  土: { vi: 'Thổ', en: 'Earth' },
}

/** Lễ / sự kiện lịch Foto (một phần — mở rộng dần) */
export const FOTO_FEST_ZH = {
  四殿五官王诞: {
    vi: 'Đản thần Ngũ quan vương điện thứ tư (lịch cổ)',
    en: 'Birthday of the 5th hall king (traditional almanac)',
  },
  至圣先师孔子讳辰: {
    vi: 'Ngày giỗ Khổng Tử (Tiên sư chí thánh)',
    en: 'Commemoration of Confucius (honorary name day)',
  },
}

export function term(map, zh, locale, fallbackZh) {
  const row = map[zh]
  if (!row) return fallbackZh ?? zh
  return locale === 'en' ? row.en : row.vi
}

export function translateJieQi(zh, locale, fallbackEn) {
  if (!zh) return ''
  const row = JIEQI_ZH[zh]
  if (row) return locale === 'en' ? row.en : row.vi
  return fallbackEn || zh
}
