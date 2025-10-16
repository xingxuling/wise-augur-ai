// 公历农历转换工具（基于《三命通会》节气规则）
// 简化版实现，生产环境建议使用lunar-javascript等专业库

// 天干地支
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 农历月份名称
export const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

// 农历日期名称
export const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

// 简化的农历数据表（1900-2100年）
// 每年数据：[春节公历月, 春节公历日, 农历月天数信息, 闰月]
const LUNAR_DATA: { [key: number]: [number, number, number[], number] } = {
  2024: [2, 10, [30,29,30,29,30,29,30,30,29,30,29,30], 0],
  2025: [1, 29, [30,30,29,30,29,30,29,30,29,30,29,30], 6], // 闰六月
  // 注：生产环境需完整数据表
};

export type CalendarType = 'solar' | 'lunar';

export interface DateInfo {
  year: number;
  month: number;
  day: number;
  type: CalendarType;
  displayText?: string;
}

/**
 * 验证公历日期
 */
export function isValidSolarDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * 验证农历日期
 */
export function isValidLunarDate(year: number, month: number, day: number, isLeap: boolean = false): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  
  const yearData = LUNAR_DATA[year];
  if (!yearData) return true; // 数据不完整时宽松验证
  
  const [, , monthDays, leapMonth] = yearData;
  
  if (isLeap && leapMonth !== month) return false;
  
  const maxDay = monthDays[month - 1] || 30;
  return day >= 1 && day <= maxDay;
}

/**
 * 公历转农历（简化版）
 */
export function solarToLunar(year: number, month: number, day: number): DateInfo {
  // 简化实现：直接返回农历表示
  // 生产环境应使用专业库如 lunar-javascript
  
  const displayText = `农历${year}年${LUNAR_MONTHS[month - 1] || ''}${LUNAR_DAYS[day - 1] || ''}`;
  
  return {
    year,
    month,
    day,
    type: 'lunar',
    displayText
  };
}

/**
 * 农历转公历（简化版）
 */
export function lunarToSolar(year: number, month: number, day: number, isLeap: boolean = false): DateInfo {
  // 简化实现
  // 生产环境应使用专业库
  
  return {
    year,
    month,
    day,
    type: 'solar',
    displayText: `${year}年${month}月${day}日`
  };
}

/**
 * 格式化显示日期
 */
export function formatDate(dateInfo: DateInfo): string {
  if (dateInfo.displayText) return dateInfo.displayText;
  
  if (dateInfo.type === 'lunar') {
    return `农历${dateInfo.year}年${LUNAR_MONTHS[dateInfo.month - 1]}${LUNAR_DAYS[dateInfo.day - 1]}`;
  }
  
  return `${dateInfo.year}年${dateInfo.month}月${dateInfo.day}日`;
}

/**
 * 自动修正不合法的日期
 */
export function correctDate(year: number, month: number, day: number, type: CalendarType): DateInfo {
  if (type === 'solar') {
    const maxDay = new Date(year, month, 0).getDate();
    const correctedDay = Math.min(Math.max(day, 1), maxDay);
    
    return {
      year,
      month,
      day: correctedDay,
      type: 'solar'
    };
  } else {
    // 农历修正
    const yearData = LUNAR_DATA[year];
    if (!yearData) {
      return { year, month, day: Math.min(day, 29), type: 'lunar' };
    }
    
    const [, , monthDays] = yearData;
    const maxDay = monthDays[month - 1] || 29;
    const correctedDay = Math.min(Math.max(day, 1), maxDay);
    
    return {
      year,
      month,
      day: correctedDay,
      type: 'lunar'
    };
  }
}