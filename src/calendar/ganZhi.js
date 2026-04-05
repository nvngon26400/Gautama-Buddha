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

export function ganZhiToVi(gz) {
  if (!gz || gz.length < 2) return gz || ''
  const g = GAN_VI[gz[0]] || gz[0]
  const z = ZHI_VI[gz[1]] || gz[1]
  return `${g} ${z}`
}

export function ganZhiToEn(gz) {
  if (!gz || gz.length < 2) return gz || ''
  const g = GAN_EN[gz[0]] || gz[0]
  const z = ZHI_EN[gz[1]] || gz[1]
  return `${g} ${z}`
}
