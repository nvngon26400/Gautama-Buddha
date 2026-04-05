import { dayKey, hashPick } from './lunarDayInfo.js'

const POOL_VI = [
  'Nên chậm lại một nhịp, lắng nghe trước khi phản hồi.',
  'Thích hợp sắp xếp lại không gian nhỏ — gọn gàng giúp tâm an.',
  'Giao tiếp rõ ràng, tránh suy diễn sẽ nhẹ nhàng hơn.',
  'Một việc nhỏ hoàn thành cũng đáng ghi nhận — đừng chờ hoàn hảo.',
  'Thân thể cần nghỉ ngơi; tránh gắng sức quá mức.',
  'Tâm tĩnh một chút, quyết định sẽ sáng hơn.',
  'Học hỏi từ phản hồi chân thành, không phải lời tán dương suông.',
  'Buông bỏ tranh luận không cần thiết — giữ hòa khí.',
  'Thích hợp kết nối người thân, nói lời tri ân.',
  'Chú ý chi tiết trong giấy tờ hoặc tin nhắn — đọc kỹ trước khi gửi.',
  'Đi chậm nhưng chắc; không cần vội vàng theo người khác.',
  'Một chút từ bi với bản thân khi chưa làm được như mong muốn.',
  'Không khí trong lành (đi bộ, thở sâu) giúp tinh thần minh mẫn.',
  'Tránh cam kết vội — cần thêm thời gian suy ngẫm.',
  'Việc cũ có thể nhắc lại: xử lý dứt điểm để nhẹ đầu.',
  'Thích hợp lập kế hoạch ngắn cho tuần tới.',
  'Lòng biết ơn nhỏ cũng đủ làm ngày ấm hơn.',
  'Cẩn trọng với chi tiêu bốc đồng.',
  'Gặp khó — nhìn thấy điểm dừng và nghỉ ngơi là đủ.',
  'Chia sẻ kiến thức hoặc kinh nghiệm sẽ có ý nghĩa.',
  'Không nên tranh giành lời nói cuối cùng.',
  'Ưu tiên giấc ngủ đủ — phục hồi năng lượng.',
  'Mở lòng với góc nhìn mới, không cần đồng ý hoàn toàn.',
  'Việc nhỏ hôm nay là nền cho điều lớn mai sau.',
]

const POOL_EN = [
  'Pause a beat—listen before you respond.',
  'A small tidy-up can settle the mind.',
  'Speak plainly; avoid reading too much into messages.',
  'Finish one small task—perfection can wait.',
  'Rest matters; avoid pushing past your limits.',
  'Quiet the mind before big decisions.',
  'Welcome honest feedback over empty praise.',
  'Skip needless arguments—keep the peace.',
  'Good day to reach out and say thanks.',
  'Double-check details in messages and documents.',
  'Slow and steady beats rushing with the crowd.',
  'Be gentle with yourself if things lag behind.',
  'Fresh air or a short walk clears the head.',
  'Avoid hasty commitments—sleep on it.',
  'Close an old loop to lighten your load.',
  'Sketch a simple plan for the week ahead.',
  'A small gratitude goes a long way.',
  'Watch impulse spending today.',
  'When stuck, pause—rest is still progress.',
  'Sharing what you know helps someone else.',
  'You do not need the last word.',
  'Prioritize sleep to recharge.',
  'Stay open to a new angle—you need not agree fully.',
  'Small steps today support bigger ones tomorrow.',
]

export function getZodiacDailyLine(zodiacIndex, date, locale) {
  const pool = locale === 'en' ? POOL_EN : POOL_VI
  const seed = `${dayKey(date)}-z${zodiacIndex}`
  return pool[hashPick(seed, pool.length)]
}
