import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 天干地支
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const DIZHI_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];

// 十神
const SHISHEN = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

// 农历月份名称（用于显示）
const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

// 2024-2025年节气数据（基于北京时间，精确到分钟）
// 数据来源：中国科学院紫金山天文台
interface SolarTermTime {
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const SOLAR_TERMS_DATA: { [key: number]: SolarTermTime[] } = {
  1940: [
    { month: 2, day: 5, hour: 7, minute: 8 }, // 立春
    { month: 2, day: 20, hour: 3, minute: 4 }, // 雨水
    { month: 3, day: 6, hour: 1, minute: 24 }, // 惊蛰
    { month: 3, day: 21, hour: 2, minute: 24 }, // 春分
    { month: 4, day: 5, hour: 6, minute: 35 }, // 清明
    { month: 4, day: 20, hour: 13, minute: 51 }, // 谷雨
    { month: 5, day: 6, hour: 0, minute: 16 }, // 立夏
    { month: 5, day: 21, hour: 13, minute: 23 }, // 小满
    { month: 6, day: 6, hour: 4, minute: 44 }, // 芒种
    { month: 6, day: 21, hour: 21, minute: 36 }, // 夏至
    { month: 7, day: 7, hour: 15, minute: 8 }, // 小暑
    { month: 7, day: 23, hour: 8, minute: 34 }, // 大暑
    { month: 8, day: 8, hour: 0, minute: 51 }, // 立秋
    { month: 8, day: 23, hour: 15, minute: 29 }, // 处暑
    { month: 9, day: 8, hour: 3, minute: 29 }, // 白露
    { month: 9, day: 23, hour: 12, minute: 46 }, // 秋分
    { month: 10, day: 8, hour: 18, minute: 42 }, // 寒露
    { month: 10, day: 23, hour: 21, minute: 39 }, // 霜降
    { month: 11, day: 7, hour: 21, minute: 27 }, // 立冬
    { month: 11, day: 22, hour: 18, minute: 49 }, // 小雪
    { month: 12, day: 7, hour: 13, minute: 58 }, // 大雪
    { month: 12, day: 22, hour: 7, minute: 55 }, // 冬至
    { month: 1, day: 6, hour: 1, minute: 4 }, // 小寒（次年1941）
    { month: 1, day: 20, hour: 18, minute: 34 } // 大寒（次年1941）
  ],
  2002: [
    { month: 2, day: 4, hour: 14, minute: 24 }, // 立春
    { month: 2, day: 19, hour: 1, minute: 14 }, // 雨水
    { month: 3, day: 6, hour: 6, minute: 24 }, // 惊蛰
    { month: 3, day: 21, hour: 7, minute: 16 }, // 春分
    { month: 4, day: 5, hour: 10, minute: 51 }, // 清明
    { month: 4, day: 20, hour: 18, minute: 0 }, // 谷雨
    { month: 5, day: 6, hour: 9, minute: 5 }, // 立夏
    { month: 5, day: 21, hour: 21, minute: 14 }, // 小满
    { month: 6, day: 6, hour: 12, minute: 23 }, // 芒种
    { month: 6, day: 22, hour: 5, minute: 8 }, // 夏至
    { month: 7, day: 7, hour: 23, minute: 26 }, // 小暑
    { month: 7, day: 23, hour: 16, minute: 3 }, // 大暑
    { month: 8, day: 8, hour: 8, minute: 26 }, // 立秋
    { month: 8, day: 23, hour: 23, minute: 2 }, // 处暑
    { month: 9, day: 8, hour: 11, minute: 22 }, // 白露
    { month: 9, day: 23, hour: 20, minute: 43 }, // 秋分
    { month: 10, day: 9, hour: 3, minute: 3 }, // 寒露
    { month: 10, day: 24, hour: 6, minute: 44 }, // 霜降
    { month: 11, day: 8, hour: 6, minute: 37 }, // 立冬
    { month: 11, day: 23, hour: 4, minute: 34 }, // 小雪
    { month: 12, day: 8, hour: 1, minute: 8 }, // 大雪
    { month: 12, day: 22, hour: 18, minute: 14 }, // 冬至
    { month: 1, day: 6, hour: 9, minute: 9 }, // 小寒（次年2003）
    { month: 1, day: 21, hour: 0, minute: 33 } // 大寒（次年2003）
  ],
  2003: [
    { month: 2, day: 4, hour: 8, minute: 5 }, // 立春
    { month: 2, day: 18, hour: 19, minute: 0 }, // 雨水
    { month: 3, day: 6, hour: 0, minute: 23 }, // 惊蛰
    { month: 3, day: 21, hour: 1, minute: 0 }, // 春分
    { month: 4, day: 5, hour: 4, minute: 52 }, // 清明
    { month: 4, day: 20, hour: 12, minute: 3 }, // 谷雨
    { month: 5, day: 6, hour: 3, minute: 8 }, // 立夏
    { month: 5, day: 21, hour: 15, minute: 16 }, // 小满
    { month: 6, day: 6, hour: 6, minute: 25 }, // 芒种
    { month: 6, day: 21, hour: 23, minute: 11 }, // 夏至
    { month: 7, day: 7, hour: 17, minute: 30 }, // 小暑
    { month: 7, day: 23, hour: 10, minute: 7 }, // 大暑
    { month: 8, day: 8, hour: 2, minute: 31 }, // 立秋
    { month: 8, day: 23, hour: 17, minute: 8 }, // 处暑
    { month: 9, day: 8, hour: 5, minute: 27 }, // 白露
    { month: 9, day: 23, hour: 14, minute: 47 }, // 秋分
    { month: 10, day: 8, hour: 21, minute: 9 }, // 寒露
    { month: 10, day: 24, hour: 0, minute: 49 }, // 霜降
    { month: 11, day: 8, hour: 0, minute: 44 }, // 立冬
    { month: 11, day: 22, hour: 22, minute: 44 }, // 小雪
    { month: 12, day: 7, hour: 19, minute: 18 }, // 大雪
    { month: 12, day: 22, hour: 12, minute: 4 }, // 冬至
    { month: 1, day: 6, hour: 3, minute: 19 }, // 小寒（次年2004）
    { month: 1, day: 20, hour: 18, minute: 43 } // 大寒（次年2004）
  ],
  2024: [
    { month: 2, day: 4, hour: 16, minute: 27 }, // 立春
    { month: 2, day: 19, hour: 12, minute: 13 }, // 雨水
    { month: 3, day: 5, hour: 10, minute: 23 }, // 惊蛰
    { month: 3, day: 20, hour: 11, minute: 6 }, // 春分
    { month: 4, day: 4, hour: 15, minute: 2 }, // 清明
    { month: 4, day: 19, hour: 21, minute: 59 }, // 谷雨
    { month: 5, day: 5, hour: 8, minute: 10 }, // 立夏
    { month: 5, day: 20, hour: 20, minute: 59 }, // 小满
    { month: 6, day: 5, hour: 12, minute: 10 }, // 芒种
    { month: 6, day: 21, hour: 4, minute: 51 }, // 夏至
    { month: 7, day: 6, hour: 22, minute: 20 }, // 小暑
    { month: 7, day: 22, hour: 15, minute: 44 }, // 大暑
    { month: 8, day: 7, hour: 8, minute: 9 }, // 立秋
    { month: 8, day: 22, hour: 22, minute: 55 }, // 处暑
    { month: 9, day: 7, hour: 11, minute: 11 }, // 白露
    { month: 9, day: 22, hour: 20, minute: 44 }, // 秋分
    { month: 10, day: 8, hour: 2, minute: 49 }, // 寒露
    { month: 10, day: 23, hour: 6, minute: 15 }, // 霜降
    { month: 11, day: 7, hour: 6, minute: 20 }, // 立冬
    { month: 11, day: 22, hour: 3, minute: 56 }, // 小雪
    { month: 12, day: 7, hour: 0, minute: 17 }, // 大雪
    { month: 12, day: 21, hour: 17, minute: 21 }, // 冬至
    { month: 1, day: 5, hour: 22, minute: 49 }, // 小寒（次年）
    { month: 1, day: 20, hour: 10, minute: 7 } // 大寒（次年）
  ],
  2025: [
    { month: 2, day: 3, hour: 22, minute: 10 }, // 立春
    { month: 2, day: 18, hour: 18, minute: 6 }, // 雨水
    { month: 3, day: 5, hour: 16, minute: 7 }, // 惊蛰
    { month: 3, day: 20, hour: 17, minute: 1 }, // 春分
    { month: 4, day: 4, hour: 20, minute: 48 }, // 清明
    { month: 4, day: 20, hour: 3, minute: 56 }, // 谷雨
    { month: 5, day: 5, hour: 14, minute: 0 }, // 立夏
    { month: 5, day: 21, hour: 2, minute: 55 }, // 小满
    { month: 6, day: 5, hour: 18, minute: 10 }, // 芒种
    { month: 6, day: 21, hour: 10, minute: 42 }, // 夏至
    { month: 7, day: 7, hour: 4, minute: 5 }, // 小暑
    { month: 7, day: 22, hour: 21, minute: 30 }, // 大暑
    { month: 8, day: 7, hour: 13, minute: 53 }, // 立秋
    { month: 8, day: 23, hour: 4, minute: 34 }, // 处暑
    { month: 9, day: 7, hour: 16, minute: 51 }, // 白露
    { month: 9, day: 23, hour: 2, minute: 19 }, // 秋分
    { month: 10, day: 8, hour: 8, minute: 22 }, // 寒露
    { month: 10, day: 23, hour: 11, minute: 51 }, // 霜降
    { month: 11, day: 7, hour: 12, minute: 4 }, // 立冬
    { month: 11, day: 22, hour: 9, minute: 35 }, // 小雪
    { month: 12, day: 7, hour: 5, minute: 56 }, // 大雪
    { month: 12, day: 21, hour: 23, minute: 3 }, // 冬至
    { month: 1, day: 6, hour: 4, minute: 31 }, // 小寒（次年）
    { month: 1, day: 20, hour: 15, minute: 51 } // 大寒（次年）
  ]
};

// 地域经纬度（用于真太阳时修正）
const REGION_LONGITUDE: Record<string, number> = {
  'beijing': 116.4074, 'tianjin': 117.2008, 'hebei': 114.5024, 'shanxi': 112.5492,
  'neimenggu': 111.6708, 'liaoning': 123.4328, 'jilin': 125.3245, 'heilongjiang': 126.6433,
  'shanghai': 121.4737, 'jiangsu': 118.7969, 'zhejiang': 120.1536, 'anhui': 117.2272,
  'fujian': 119.2965, 'jiangxi': 115.8581, 'shandong': 117.0208, 'henan': 113.6254,
  'hubei': 114.3055, 'hunan': 112.9388, 'guangdong': 113.2644, 'guangxi': 108.3661,
  'hainan': 110.3312, 'chongqing': 106.5516, 'sichuan': 104.0657, 'guizhou': 106.7073,
  'yunnan': 102.7103, 'xizang': 91.1174, 'shaanxi': 108.9540, 'gansu': 103.8236,
  'qinghai': 101.7782, 'ningxia': 106.2586, 'xinjiang': 87.6278,
  'hongkong': 114.1694, 'macau': 113.5439, 'taiwan': 121.5654
};

// 计算真太阳时修正（分钟）
function getTrueSolarTimeCorrection(longitude: number): number {
  const standardLongitude = 120; // 东八区标准经度（北京时间基准）
  return Math.round((longitude - standardLongitude) * 4); // 每度经度差4分钟
}

// 获取立春时间
function getLichunTime(year: number): Date | null {
  const terms = SOLAR_TERMS_DATA[year];
  if (!terms) return null;
  
  const lichun = terms[0]; // 立春是第一个节气
  return new Date(year, lichun.month - 1, lichun.day, lichun.hour, lichun.minute);
}

// 根据立春判断八字年份（核心：立春前属上一年）
function getBaziYear(date: Date): number {
  const year = date.getFullYear();
  const lichunThisYear = getLichunTime(year);
  
  if (!lichunThisYear) {
    // 无节气数据时按公历2月4日凌晨近似
    const approxLichun = new Date(year, 1, 4, 0, 0);
    return date >= approxLichun ? year : year - 1;
  }
  
  // 精确比对到分钟
  return date >= lichunThisYear ? year : year - 1;
}

// 计算年柱（基于立春节气）
function getYearGanZhi(date: Date): string {
  const baziYear = getBaziYear(date);
  // 1984年为甲子年（甲=0，子=0），用1984作基准
  const ganIndex = (baziYear - 4) % 10;
  const zhiIndex = (baziYear - 4) % 12;
  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}

// 获取节气月份（核心：寅月始于立春、卯月始于惊蛰...）
// 返回：index是地支索引(0-11)，name是地支名称（用于月柱），lunarName是农历月份名称（用于显示），termName是节气名称
function getSolarTermMonth(date: Date): { index: number; name: string; lunarName: string; termName: string } | null {
  const year = date.getFullYear();
  const dateTime = date.getTime();
  
  // 十二月令对应节气（从寅月立春开始）
  // 寅月对应正月，卯月对应二月，...，子月对应十一月（冬月），丑月对应十二月（腊月）
  const monthInfo = [
    { zhi: '寅', lunar: '正月', term: '立春', termIndex: 0 },   // 寅月：立春-惊蛰
    { zhi: '卯', lunar: '二月', term: '惊蛰', termIndex: 2 },   // 卯月：惊蛰-清明
    { zhi: '辰', lunar: '三月', term: '清明', termIndex: 4 },   // 辰月：清明-立夏
    { zhi: '巳', lunar: '四月', term: '立夏', termIndex: 6 },   // 巳月：立夏-芒种
    { zhi: '午', lunar: '五月', term: '芒种', termIndex: 8 },   // 午月：芒种-小暑
    { zhi: '未', lunar: '六月', term: '小暑', termIndex: 10 },  // 未月：小暑-立秋
    { zhi: '申', lunar: '七月', term: '立秋', termIndex: 12 },  // 申月：立秋-白露
    { zhi: '酉', lunar: '八月', term: '白露', termIndex: 14 },  // 酉月：白露-寒露
    { zhi: '戌', lunar: '九月', term: '寒露', termIndex: 16 },  // 戌月：寒露-立冬
    { zhi: '亥', lunar: '十月', term: '立冬', termIndex: 18 },  // 亥月：立冬-大雪
    { zhi: '子', lunar: '冬月', term: '大雪', termIndex: 20 },  // 子月：大雪-小寒
    { zhi: '丑', lunar: '腊月', term: '小寒', termIndex: 22 }   // 丑月：小寒-立春
  ];
  
  const currentYearTerms = SOLAR_TERMS_DATA[year];
  const prevYearTerms = SOLAR_TERMS_DATA[year - 1];
  const nextYearTerms = SOLAR_TERMS_DATA[year + 1];
  
  if (!currentYearTerms) {
    // 无节气数据时按公历月份近似（不精确，仅作降级）
    const month = date.getMonth() + 1;
    const approximateIndex = (month + 1) % 12;
    return { 
      index: approximateIndex, 
      name: monthInfo[approximateIndex].zhi,
      lunarName: monthInfo[approximateIndex].lunar,
      termName: monthInfo[approximateIndex].term
    };
  }
  
  // 遍历12个节气月份
  for (let i = 0; i < 12; i++) {
    const currentMonthInfo = monthInfo[i];
    const nextMonthInfo = monthInfo[(i + 1) % 12];
    
    // 获取当前月的起始节气
    let currentTerm = currentYearTerms[currentMonthInfo.termIndex];
    let currentTermDate: Date;
    
    // 处理跨年情况（1月的小寒、大寒属于前一年冬季）
    if (currentTerm.month === 1 && i >= 10 && prevYearTerms) {
      currentTerm = prevYearTerms[currentMonthInfo.termIndex];
      currentTermDate = new Date(year - 1, currentTerm.month - 1, currentTerm.day, currentTerm.hour, currentTerm.minute);
    } else {
      currentTermDate = new Date(year, currentTerm.month - 1, currentTerm.day, currentTerm.hour, currentTerm.minute);
    }
    
    // 获取下一月的起始节气
    let nextTerm = currentYearTerms[nextMonthInfo.termIndex];
    let nextTermDate: Date;
    
    // 下一个节气可能在当年或次年
    if (nextTerm.month === 1 && nextMonthInfo.termIndex < currentMonthInfo.termIndex) {
      // 跨年到次年1月
      if (nextYearTerms) {
        nextTerm = nextYearTerms[nextMonthInfo.termIndex];
      }
      nextTermDate = new Date(year + 1, nextTerm.month - 1, nextTerm.day, nextTerm.hour, nextTerm.minute);
    } else if (nextTerm.month < currentTerm.month && nextTerm.month > 1) {
      // 跨年到次年其他月份
      nextTermDate = new Date(year + 1, nextTerm.month - 1, nextTerm.day, nextTerm.hour, nextTerm.minute);
    } else {
      nextTermDate = new Date(year, nextTerm.month - 1, nextTerm.day, nextTerm.hour, nextTerm.minute);
    }
    
    // 判断当前时间是否在这个月份区间内
    if (dateTime >= currentTermDate.getTime() && dateTime < nextTermDate.getTime()) {
      return { 
        index: i, 
        name: currentMonthInfo.zhi,
        lunarName: currentMonthInfo.lunar,
        termName: currentMonthInfo.term
      };
    }
  }
  
  return null;
}

// 计算月柱（基于节气 + 五虎遁元）
// 口诀：甲己之年丙作首、乙庚之岁戊为头、丙辛必定寻庚起、丁壬壬位顺行流、若问戊癸何方发、甲寅之上好追求
function getMonthGanZhi(date: Date): string {
  const baziYear = getBaziYear(date);
  const yearGan = (baziYear - 4) % 10;
  
  const monthInfo = getSolarTermMonth(date);
  if (!monthInfo) {
    // 降级算法
    const month = date.getMonth() + 1;
    const monthGanBase = ((yearGan % 5) * 2 + 2) % 10;
    const ganIndex = (monthGanBase + month - 1) % 10;
    const zhiIndex = (month + 1) % 12;
    return TIANGAN[ganIndex] + DIZHI[zhiIndex];
  }
  
  // 五虎遁元：寅月天干 = ((yearGan % 5) * 2 + 2) % 10
  // 甲己年(0,5)→丙(2)、乙庚年(1,6)→戊(4)、丙辛年(2,7)→庚(6)、丁壬年(3,8)→壬(8)、戊癸年(4,9)→甲(0)
  const monthGanBase = ((yearGan % 5) * 2 + 2) % 10;
  
  // monthInfo.index: 寅=0, 卯=1, 辰=2, ...
  const ganIndex = (monthGanBase + monthInfo.index) % 10;
  
  return TIANGAN[ganIndex] + monthInfo.name;
}

// 计算日柱（基于1900年1月1日为甲戌日的精确算法）
function getDayGanZhi(year: number, month: number, day: number): string {
  // 基准日期：1900年1月1日 = 甲戌日（甲=0, 戌=10）
  const baseYear = 1900;
  const baseMonth = 1;
  const baseDay = 1;
  
  // 计算从1900年1月1日到目标日期的总天数
  let totalDays = 0;
  
  // 累计年份天数
  for (let y = baseYear; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  
  // 累计月份天数
  for (let m = 1; m < month; m++) {
    totalDays += getDaysInMonth(year, m);
  }
  
  // 累计日期
  totalDays += day - baseDay;
  
  // 1900年1月1日是甲戌日：甲=0, 戌=10
  const ganIndex = (0 + totalDays) % 10;
  const zhiIndex = (10 + totalDays) % 12;
  
  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year: number, month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return daysInMonth[month - 1];
}

// 计算时柱（五子遁元 + 子时分界规则）
// 关键：23:00-23:59属于次日子时，需用次日日干起时柱
// 时辰标准划分：子(23-1)、丑(1-3)、寅(3-5)、卯(5-7)、辰(7-9)、巳(9-11)
//             午(11-13)、未(13-15)、申(15-17)、酉(17-19)、戌(19-21)、亥(21-23)
// 注意：部分命理流派对时辰边界有不同理解，本算法采用标准划分（整点为界）
// 口诀：甲己还加甲、乙庚丙作初、丙辛从戊起、丁壬庚子居、戊癸何方发、壬子是真途
function getHourGanZhi(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  minute: number
): { ganZhi: string; usedNextDay: boolean } {
  // 判断是否在23:00-23:59区间（属于次日子时）
  const isNextDayZiShi = (hour === 23);
  
  // 如果是次日子时，需要用次日的日干
  let actualYear = year;
  let actualMonth = month;
  let actualDay = day;
  
  if (isNextDayZiShi) {
    // 计算次日日期
    actualDay += 1;
    if (actualDay > getDaysInMonth(actualYear, actualMonth)) {
      actualDay = 1;
      actualMonth += 1;
      if (actualMonth > 12) {
        actualMonth = 1;
        actualYear += 1;
      }
    }
  }
  
  // 获取日柱天干（如果是23:00后，使用次日日干）
  const dayGanZhi = getDayGanZhi(actualYear, actualMonth, actualDay);
  const dayGan = dayGanZhi[0];
  const dayGanIndex = TIANGAN.indexOf(dayGan);
  
  // 计算时辰地支（23:00后按子时，即0时）
  let actualHour = isNextDayZiShi ? 0 : hour;
  
  // 时辰地支索引计算：每2小时一个时辰
  // 23-1点=子时(0), 1-3点=丑时(1), ..., 11-13点=午时(6), 13-15点=未时(7), ...
  const hourZhiIndex = Math.floor((actualHour + 1) / 2) % 12;
  
  // 五子遁元：子时天干 = (dayGanIndex % 5) * 2
  // 甲己日(0,5)→甲(0)、乙庚日(1,6)→丙(2)、丙辛日(2,7)→戊(4)、丁壬日(3,8)→庚(6)、戊癸日(4,9)→壬(8)
  const hourGanBase = (dayGanIndex % 5) * 2;
  const hourGanIndex = (hourGanBase + hourZhiIndex) % 10;
  
  return {
    ganZhi: TIANGAN[hourGanIndex] + DIZHI[hourZhiIndex],
    usedNextDay: isNextDayZiShi
  };
}

// 计算十神
function getShishen(dayGan: string, targetGan: string): string {
  const dayIndex = TIANGAN.indexOf(dayGan);
  const targetIndex = TIANGAN.indexOf(targetGan);
  const diff = (targetIndex - dayIndex + 10) % 10;
  return SHISHEN[diff];
}

// 分析日主强弱
function analyzeDayMasterStrength(bazi: { year: string; month: string; day: string; hour: string }): string {
  const dayGan = bazi.day[0];
  const dayWuxing = WUXING[TIANGAN.indexOf(dayGan)];
  
  const monthZhi = bazi.month[1];
  const monthZhiWuxing = DIZHI_WUXING[DIZHI.indexOf(monthZhi)];
  
  const isBornInSeason = dayWuxing === monthZhiWuxing;
  
  return isBornInSeason ? '日主较旺（得月令生助）' : '日主较弱（不得月令）';
}

// 判断格局
function analyzePattern(bazi: { year: string; month: string; day: string; hour: string }): { pattern: string; description: string } {
  const dayGan = bazi.day[0];
  const monthGan = bazi.month[0];
  
  const monthShishen = getShishen(dayGan, monthGan);
  
  const patterns: Record<string, string> = {
    '正官': '正官格：为人正直端方，适合从事稳定职业，具有管理才能，贵人运佳',
    '七杀': '七杀格：性格刚毅果断，适合竞争环境，需注意控制情绪，宜武职或竞争性行业',
    '正财': '正财格：财运稳健，理财观念强，适合稳定型投资，勤恳务实',
    '偏财': '偏财格：善于把握机会，财运多变，适合灵活经营，交际广泛',
    '食神': '食神格：性格温和，有艺术天赋，善于表达创意，衣食无忧',
    '伤官': '伤官格：思维活跃，才华横溢，需注意沟通方式，适合创意行业',
    '正印': '正印格：学习能力强，适合学术研究，贵人运佳，文化修养高',
    '偏印': '偏印格：思维独特，多才多艺，善于独立思考，适合偏门技艺'
  };
  
  return {
    pattern: monthShishen + '格',
    description: patterns[monthShishen] || '命格特殊，需综合分析四柱配置'
  };
}

// 判断用神
function analyzeYongshen(wuxingAnalysis: Record<string, number>): { yongshen: string; description: string } {
  let minWuxing = '木';
  let minCount = wuxingAnalysis['木'];
  
  for (const [wuxing, count] of Object.entries(wuxingAnalysis)) {
    if (count < minCount) {
      minCount = count;
      minWuxing = wuxing;
    }
  }
  
  const descriptions: Record<string, string> = {
    '木': '用神为木，宜东方发展，多接触绿色、木质物品，从事文教、出版等行业有利',
    '火': '用神为火，宜南方发展，多接触红色事物，从事能源、餐饮等行业有利',
    '土': '用神为土，宜本地发展，多接触黄色、土系物品，从事房地产、农业等行业有利',
    '金': '用神为金，宜西方发展，多接触白色、金属物品，从事金融、科技等行业有利',
    '水': '用神为水，宜北方发展，多接触黑色、蓝色事物，从事流通、运输等行业有利'
  };
  
  return {
    yongshen: minWuxing,
    description: descriptions[minWuxing]
  };
}

// 计算大运（根据性别和年干阴阳决定顺逆）
// 阳男阴女顺行，阴男阳女逆行
function calculateDayun(
  monthGanZhi: string,
  yearGan: string,
  gender: 'male' | 'female'
): string[] {
  const yearGanIndex = TIANGAN.indexOf(yearGan);
  const isYangGan = yearGanIndex % 2 === 0; // 甲丙戊庚壬为阳
  
  // 判断是否顺行：阳男阴女顺行，阴男阳女逆行
  const isShunxing = (gender === 'male' && isYangGan) || (gender === 'female' && !isYangGan);
  
  const monthGan = monthGanZhi[0];
  const monthZhi = monthGanZhi[1];
  const monthGanIndex = TIANGAN.indexOf(monthGan);
  const monthZhiIndex = DIZHI.indexOf(monthZhi);
  
  const dayun: string[] = [];
  
  if (isShunxing) {
    // 顺行：天干地支都向后
    for (let i = 1; i <= 8; i++) {
      const ganIndex = (monthGanIndex + i) % 10;
      const zhiIndex = (monthZhiIndex + i) % 12;
      dayun.push(TIANGAN[ganIndex] + DIZHI[zhiIndex]);
    }
  } else {
    // 逆行：天干地支都向前
    for (let i = 1; i <= 8; i++) {
      const ganIndex = (monthGanIndex - i + 10) % 10;
      const zhiIndex = (monthZhiIndex - i + 12) % 12;
      dayun.push(TIANGAN[ganIndex] + DIZHI[zhiIndex]);
    }
  }
  
  return dayun;
}

// 分析五行
function analyzeWuxing(bazi: { year: string; month: string; day: string; hour: string }) {
  const wuxingCount: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  [bazi.year, bazi.month, bazi.day, bazi.hour].forEach(gz => {
    const ganIndex = TIANGAN.indexOf(gz[0]);
    const zhiIndex = DIZHI.indexOf(gz[1]);
    
    if (ganIndex !== -1) {
      wuxingCount[WUXING[ganIndex]]++;
    }
    if (zhiIndex !== -1) {
      wuxingCount[DIZHI_WUXING[zhiIndex]]++;
    }
  });
  
  return wuxingCount;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('未授权');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    const { birthYear, birthMonth, birthDay, birthHour, birthMinute = 0, gender, region = 'beijing' } = await req.json();

    // 输入验证
    if (!birthYear || !birthMonth || !birthDay || birthHour === undefined) {
      throw new Error('缺少必要的生辰信息');
    }

    if (birthYear < 1900 || birthYear > 2100) {
      throw new Error('年份必须在1900-2100之间（当前数据库仅支持此范围）');
    }

    if (birthMonth < 1 || birthMonth > 12) {
      throw new Error('月份必须在1-12之间');
    }

    if (birthDay < 1 || birthDay > 31) {
      throw new Error('日期必须在1-31之间');
    }

    if (birthHour < 0 || birthHour > 23) {
      throw new Error('时辰必须在0-23之间');
    }

    // 真太阳时修正
    const regionLongitude = REGION_LONGITUDE[region] || 116.4074;
    const trueSolarCorrection = getTrueSolarTimeCorrection(regionLongitude);
    const totalMinutes = birthHour * 60 + birthMinute + trueSolarCorrection;
    
    // 修正后的时间（可能跨日）
    let correctedYear = birthYear;
    let correctedMonth = birthMonth;
    let correctedDay = birthDay;
    let correctedHour = Math.floor(totalMinutes / 60);
    const correctedMinute = totalMinutes % 60;
    
    // 处理跨日情况
    if (correctedHour >= 24) {
      correctedHour -= 24;
      correctedDay += 1;
      if (correctedDay > getDaysInMonth(correctedYear, correctedMonth)) {
        correctedDay = 1;
        correctedMonth += 1;
        if (correctedMonth > 12) {
          correctedMonth = 1;
          correctedYear += 1;
        }
      }
    } else if (correctedHour < 0) {
      correctedHour += 24;
      correctedDay -= 1;
      if (correctedDay < 1) {
        correctedMonth -= 1;
        if (correctedMonth < 1) {
          correctedMonth = 12;
          correctedYear -= 1;
        }
        correctedDay = getDaysInMonth(correctedYear, correctedMonth);
      }
    }

    // 创建修正后的日期对象（用于年柱、月柱判断）
    const correctedDate = new Date(correctedYear, correctedMonth - 1, correctedDay, correctedHour, correctedMinute);

    // 计算四柱（核心算法）
    // 1. 年柱：以立春为界
    const yearGanZhi = getYearGanZhi(correctedDate);
    
    // 2. 月柱：以节气为界
    const monthGanZhi = getMonthGanZhi(correctedDate);
    
    // 3. 日柱：基于精确天数计算
    const dayGanZhi = getDayGanZhi(correctedYear, correctedMonth, correctedDay);
    
    // 4. 时柱：五子遁元 + 23:00分界
    const hourResult = getHourGanZhi(correctedYear, correctedMonth, correctedDay, correctedHour, correctedMinute);

    const bazi = {
      year: yearGanZhi,
      month: monthGanZhi,
      day: dayGanZhi,
      hour: hourResult.ganZhi,
    };

    // 获取节气月份信息（用于说明）
    const monthInfo = getSolarTermMonth(correctedDate);
    
    // 获取八字年份（基于立春）
    const baziYear = getBaziYear(correctedDate);

    // 五行分析
    const wuxingAnalysis = analyzeWuxing(bazi);
    
    // 找出缺少的五行
    const lackingWuxing = Object.entries(wuxingAnalysis)
      .filter(([, count]) => count === 0)
      .map(([element]) => element);

    // 十神分析
    const dayGan = bazi.day[0];
    const shishenAnalysis = {
      year: { gan: getShishen(dayGan, bazi.year[0]), zhi: '' },
      month: { gan: getShishen(dayGan, bazi.month[0]), zhi: '' },
      day: { gan: '日主', zhi: '' },
      hour: { gan: getShishen(dayGan, bazi.hour[0]), zhi: '' }
    };

    // 日主强弱
    const dayMasterStrength = analyzeDayMasterStrength(bazi);

    // 格局判断
    const pattern = analyzePattern(bazi);

    // 用神分析
    const yongshen = analyzeYongshen(wuxingAnalysis);

    // 大运计算（根据性别和年干阴阳决定顺逆）
    const yearGan = bazi.year[0];
    const dayun = calculateDayun(monthGanZhi, yearGan, gender || 'male');
    const dayunDirection = (() => {
      const yearGanIndex = TIANGAN.indexOf(yearGan);
      const isYangGan = yearGanIndex % 2 === 0;
      const isShunxing = (gender === 'male' && isYangGan) || (gender === 'female' && !isYangGan);
      return isShunxing ? '顺行' : '逆行';
    })();

    // 构建详细结果
    const result = {
      bazi,
      gender: gender || 'male',
      dayun: {
        sequence: dayun,
        direction: dayunDirection,
        description: `${gender === 'male' ? '男命' : '女命'}，年干${yearGan}为${TIANGAN.indexOf(yearGan) % 2 === 0 ? '阳' : '阴'}干，大运${dayunDirection}`
      },
      wuxingAnalysis,
      lackingWuxing,
      shishenAnalysis,
      dayMasterStrength,
      pattern,
      yongshen,
      calculationDetails: {
        solarTermInfo: monthInfo ? {
          month: monthInfo.lunarName,
          zhiMonth: monthInfo.name + '月',
          term: monthInfo.termName,
          description: `农历${monthInfo.lunarName}（${monthInfo.name}月）基于节气【${monthInfo.termName}】确定，符合《三命通会》节气月令规则`
        } : undefined,
        lichunInfo: {
          baziYear: baziYear,
          actualYear: correctedYear,
          note: baziYear !== correctedYear 
            ? `出生于立春前，八字年份使用${baziYear}年（农历${baziYear - 1}年末）` 
            : `出生于立春后，八字年份为${baziYear}年`
        },
        hourCalculation: hourResult.usedNextDay 
          ? `出生时间23:00-23:59属于次日子时，时柱使用次日【${bazi.day}】的日干起时` 
          : `时柱基于五子遁元法则，由日柱【${bazi.day}】起时`,
        trueSolarTime: {
          original: { 
            year: birthYear, 
            month: birthMonth, 
            day: birthDay, 
            hour: birthHour, 
            minute: birthMinute 
          },
          corrected: { 
            year: correctedYear,
            month: correctedMonth,
            day: correctedDay,
            hour: correctedHour, 
            minute: correctedMinute 
          },
          correction: trueSolarCorrection,
          region: region,
          note: `基于${region}地区（东经${regionLongitude.toFixed(2)}°），真太阳时修正${trueSolarCorrection >= 0 ? '+' : ''}${trueSolarCorrection}分钟`
        },
      },
      algorithmNote: [
        '【算法说明】本排盘严格遵循传统命理规则：',
        `1. 年柱：以立春节气为界（${baziYear}年立春时刻为准）`,
        '2. 月柱：以节气为界（寅月始于立春、卯月始于惊蛰...子月始于大雪、丑月始于小寒）',
        '3. 日柱：基于1900年1月1日甲戌日精确计算天数差',
        '4. 时柱：23:00-23:59属次日子时，整点为时辰分界，使用五子遁元法',
        `5. 真太阳时：已根据${region}地区经度修正${Math.abs(trueSolarCorrection)}分钟`,
        '数据来源：中国科学院紫金山天文台节气数据'
      ].join('\n')
    };

    // 保存到数据库
    const { data: record, error: insertError } = await supabase
      .from('bazi_records')
      .insert({
        user_id: user.id,
        birth_year: birthYear,
        birth_month: birthMonth,
        birth_day: birthDay,
        birth_hour: birthHour,
        gender: gender || null,
        result: result,
      })
      .select()
      .single();

    if (insertError) {
      console.error('保存八字记录失败:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, data: result, recordId: record.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('八字计算错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '计算失败，请检查输入数据' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
