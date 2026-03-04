import dayjs, { Dayjs } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 扩展 dayjs 插件
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 日期格式化工具
 */

/**
 * 格式化日期为指定格式
 * @param date 日期对象、时间戳或日期字符串
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | number | string | Dayjs,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化为日期（不含时间）
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export function formatDateOnly(date: Date | number | string | Dayjs): string {
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 格式化为时间（不含日期）
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的时间字符串 (HH:mm:ss)
 */
export function formatTimeOnly(date: Date | number | string | Dayjs): string {
  return formatDate(date, 'HH:mm:ss')
}

/**
 * 格式化为日期时间（精确到分钟）
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期时间字符串 (YYYY-MM-DD HH:mm)
 */
export function formatDateTime(date: Date | number | string | Dayjs): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm')
}

/**
 * 格式化为相对时间（如：3分钟前、2小时前）
 * @param date 日期对象、时间戳或日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: Date | number | string | Dayjs): string {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 格式化为友好的时间显示
 * 今天：显示时间
 * 昨天：显示"昨天 HH:mm"
 * 今年：显示"MM-DD HH:mm"
 * 往年：显示"YYYY-MM-DD HH:mm"
 * @param date 日期对象、时间戳或日期字符串
 * @returns 友好的时间字符串
 */
export function formatFriendlyTime(date: Date | number | string | Dayjs): string {
  if (!date) return ''

  const target = dayjs(date)
  const now = dayjs()

  // 今天
  if (target.isSame(now, 'day')) {
    return target.format('HH:mm')
  }

  // 昨天
  if (target.isSame(now.subtract(1, 'day'), 'day')) {
    return `昨天 ${target.format('HH:mm')}`
  }

  // 今年
  if (target.isSame(now, 'year')) {
    return target.format('MM-DD HH:mm')
  }

  // 往年
  return target.format('YYYY-MM-DD HH:mm')
}

/**
 * 判断日期是否为今天
 * @param date 日期对象、时间戳或日期字符串
 * @returns 是否为今天
 */
export function isToday(date: Date | number | string | Dayjs): boolean {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断日期是否为昨天
 * @param date 日期对象、时间戳或日期字符串
 * @returns 是否为昨天
 */
export function isYesterday(date: Date | number | string | Dayjs): boolean {
  if (!date) return false
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

/**
 * 判断日期是否为本周
 * @param date 日期对象、时间戳或日期字符串
 * @returns 是否为本周
 */
export function isThisWeek(date: Date | number | string | Dayjs): boolean {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'week')
}

/**
 * 判断日期是否为本月
 * @param date 日期对象、时间戳或日期字符串
 * @returns 是否为本月
 */
export function isThisMonth(date: Date | number | string | Dayjs): boolean {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'month')
}

/**
 * 判断日期是否为本年
 * @param date 日期对象、时间戳或日期字符串
 * @returns 是否为本年
 */
export function isThisYear(date: Date | number | string | Dayjs): boolean {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'year')
}

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差（绝对值）
 */
export function getDaysDiff(
  date1: Date | number | string | Dayjs,
  date2: Date | number | string | Dayjs
): number {
  return Math.abs(dayjs(date1).diff(dayjs(date2), 'day'))
}

/**
 * 计算两个日期之间的小时差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 小时差（绝对值）
 */
export function getHoursDiff(
  date1: Date | number | string | Dayjs,
  date2: Date | number | string | Dayjs
): number {
  return Math.abs(dayjs(date1).diff(dayjs(date2), 'hour'))
}

/**
 * 计算两个日期之间的分钟差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 分钟差（绝对值）
 */
export function getMinutesDiff(
  date1: Date | number | string | Dayjs,
  date2: Date | number | string | Dayjs
): number {
  return Math.abs(dayjs(date1).diff(dayjs(date2), 'minute'))
}

/**
 * 获取日期范围的开始和结束时间
 * @param type 范围类型：'today' | 'week' | 'month' | 'year'
 * @returns 开始和结束时间
 */
export function getDateRange(
  type: 'today' | 'week' | 'month' | 'year'
): { start: string; end: string } {
  const now = dayjs()
  let start: Dayjs
  let end: Dayjs

  switch (type) {
    case 'today':
      start = now.startOf('day')
      end = now.endOf('day')
      break
    case 'week':
      start = now.startOf('week')
      end = now.endOf('week')
      break
    case 'month':
      start = now.startOf('month')
      end = now.endOf('month')
      break
    case 'year':
      start = now.startOf('year')
      end = now.endOf('year')
      break
    default:
      start = now.startOf('day')
      end = now.endOf('day')
  }

  return {
    start: start.format('YYYY-MM-DD HH:mm:ss'),
    end: end.format('YYYY-MM-DD HH:mm:ss'),
  }
}

/**
 * 获取最近N天的日期范围
 * @param days 天数
 * @returns 开始和结束时间
 */
export function getRecentDaysRange(days: number): { start: string; end: string } {
  const now = dayjs()
  const start = now.subtract(days - 1, 'day').startOf('day')
  const end = now.endOf('day')

  return {
    start: start.format('YYYY-MM-DD HH:mm:ss'),
    end: end.format('YYYY-MM-DD HH:mm:ss'),
  }
}

/**
 * 解析日期字符串为 Dayjs 对象
 * @param dateString 日期字符串
 * @returns Dayjs 对象
 */
export function parseDate(dateString: string): Dayjs {
  return dayjs(dateString)
}

/**
 * 获取当前时间戳（毫秒）
 * @returns 时间戳
 */
export function getTimestamp(): number {
  return Date.now()
}

/**
 * 获取当前时间戳（秒）
 * @returns 时间戳
 */
export function getTimestampInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * 格式化时长（秒）为可读字符串
 * @param seconds 秒数
 * @returns 格式化后的时长字符串（如：1小时30分钟）
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}分钟`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}小时`
  }

  return `${hours}小时${remainingMinutes}分钟`
}

/**
 * 格式化时长（秒）为 HH:mm:ss 格式
 * @param seconds 秒数
 * @returns 格式化后的时长字符串（如：01:30:45）
 */
export function formatDurationTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [hours, minutes, secs].map((v) => String(v).padStart(2, '0')).join(':')
}

export default {
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatDateTime,
  formatRelativeTime,
  formatFriendlyTime,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  getDaysDiff,
  getHoursDiff,
  getMinutesDiff,
  getDateRange,
  getRecentDaysRange,
  parseDate,
  getTimestamp,
  getTimestampInSeconds,
  formatDuration,
  formatDurationTime,
}
