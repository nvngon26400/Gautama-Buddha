import fs from 'fs'

const s = fs.readFileSync('node_modules/lunar-javascript/lunar.js', 'utf8')
const re = /'yj\.([^']+)':\s*'([^']+)',/g
const iEn = s.indexOf("'en': {")
const sChs = s.slice(0, iEn)
const sEn = s.slice(iEn)
const chs = {}
let m
while ((m = re.exec(sChs))) {
  chs[m[1]] = m[2]
}
const en = {}
while ((m = re.exec(sEn))) {
  en[m[1]] = m[2]
}
const pairs = {}
for (const id of Object.keys(chs)) {
  pairs[id] = { zh: chs[id], en: en[id] || '' }
}
fs.writeFileSync(
  new URL('./yj-pairs.json', import.meta.url),
  JSON.stringify(pairs, null, 2),
  'utf8',
)
console.error('written', Object.keys(pairs).length)
