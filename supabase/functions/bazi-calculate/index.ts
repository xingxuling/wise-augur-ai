import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Solar, Lunar } from "https://esm.sh/lunar-javascript@1.7.5";

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

// 获取立春时间（使用lunar-javascript库）
function getLichunTime(year: number): Date | null {
  try {
    // 创建该年1月1日的Solar对象
    const solar = Solar.fromYmd(year, 1, 1);
    const lunar = solar.getLunar();
    
    // 获取节气表
    const jieQiTable = lunar.getJieQiTable();
    
    // 查找立春节气
    for (const [jieQiName, solarDate] of Object.entries(jieQiTable)) {
      if (jieQiName === '立春') {
        const jqSolar = solarDate as any;
        return new Date(
          jqSolar.getYear(),
          jqSolar.getMonth() - 1,
          jqSolar.getDay(),
          jqSolar.getHour(),
          jqSolar.getMinute()
        );
      }
    }
    
    // 立春通常在2月3-5日
    return new Date(year, 1, 4, 0, 0);
  } catch (error) {
    console.error('获取立春时间失败:', error);
    return new Date(year, 1, 4, 0, 0);
  }
}

// 获取节气月份（使用lunar-javascript库动态计算）
function getSolarTermMonth(date: Date): { index: number; name: string; lunarName: string; termName: string } | null {
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // 创建Solar对象并获取Lunar对象
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    
    // 获取节气表
    const jieQiTable = lunar.getJieQiTable();
    
    // 十二月令对应节气（从寅月立春开始）
    const monthInfo = [
      { zhi: '寅', lunar: '正月', term: '立春', termIndex: 0 },
      { zhi: '卯', lunar: '二月', term: '惊蛰', termIndex: 1 },
      { zhi: '辰', lunar: '三月', term: '清明', termIndex: 2 },
      { zhi: '巳', lunar: '四月', term: '立夏', termIndex: 3 },
      { zhi: '午', lunar: '五月', term: '芒种', termIndex: 4 },
      { zhi: '未', lunar: '六月', term: '小暑', termIndex: 5 },
      { zhi: '申', lunar: '七月', term: '立秋', termIndex: 6 },
      { zhi: '酉', lunar: '八月', term: '白露', termIndex: 7 },
      { zhi: '戌', lunar: '九月', term: '寒露', termIndex: 8 },
      { zhi: '亥', lunar: '十月', term: '立冬', termIndex: 9 },
      { zhi: '子', lunar: '冬月', term: '大雪', termIndex: 10 },
      { zhi: '丑', lunar: '腊月', term: '小寒', termIndex: 11 }
    ];
    
    const currentDateTime = new Date(year, month - 1, day, hour, minute).getTime();
    
    // 遍历12个月，找出当前时间所属的节气月
    for (let i = 0; i < 12; i++) {
      const currentMonthInfo = monthInfo[i];
      const nextMonthInfo = monthInfo[(i + 1) % 12];
      
      // 获取当前月的起始节气
      const currentTermSolar = jieQiTable[currentMonthInfo.term] as any;
      const nextTermSolar = jieQiTable[nextMonthInfo.term] as any;
      
      if (!currentTermSolar || !nextTermSolar) continue;
      
      const currentTermTime = new Date(
        currentTermSolar.getYear(),
        currentTermSolar.getMonth() - 1,
        currentTermSolar.getDay(),
        currentTermSolar.getHour(),
        currentTermSolar.getMinute()
      ).getTime();
      
      const nextTermTime = new Date(
        nextTermSolar.getYear(),
        nextTermSolar.getMonth() - 1,
        nextTermSolar.getDay(),
        nextTermSolar.getHour(),
        nextTermSolar.getMinute()
      ).getTime();
      
      // 判断当前时间是否在这个月份区间内
      if (currentDateTime >= currentTermTime && currentDateTime < nextTermTime) {
        return {
          index: i,
          name: currentMonthInfo.zhi,
          lunarName: currentMonthInfo.lunar,
          termName: currentMonthInfo.term
        };
      }
    }
    
    // 降级处理
    const approximateIndex = (month + 1) % 12;
    return {
      index: approximateIndex,
      name: monthInfo[approximateIndex].zhi,
      lunarName: monthInfo[approximateIndex].lunar,
      termName: monthInfo[approximateIndex].term
    };
  } catch (error) {
    console.error('获取节气月份失败:', error);
    const month = date.getMonth() + 1;
    const monthInfo = [
      { zhi: '寅', lunar: '正月', term: '立春' },
      { zhi: '卯', lunar: '二月', term: '惊蛰' },
      { zhi: '辰', lunar: '三月', term: '清明' },
      { zhi: '巳', lunar: '四月', term: '立夏' },
      { zhi: '午', lunar: '五月', term: '芒种' },
      { zhi: '未', lunar: '六月', term: '小暑' },
      { zhi: '申', lunar: '七月', term: '立秋' },
      { zhi: '酉', lunar: '八月', term: '白露' },
      { zhi: '戌', lunar: '九月', term: '寒露' },
      { zhi: '亥', lunar: '十月', term: '立冬' },
      { zhi: '子', lunar: '冬月', term: '大雪' },
      { zhi: '丑', lunar: '腊月', term: '小寒' }
    ];
    const approximateIndex = (month + 1) % 12;
    return {
      index: approximateIndex,
      name: monthInfo[approximateIndex].zhi,
      lunarName: monthInfo[approximateIndex].lunar,
      termName: monthInfo[approximateIndex].term
    };
  }
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

// ========== 特殊格局识别系统（基于《三命通会》《滴天髓》等经典） ==========

// 判断专旺格（曲直、炎上、稼穑、从革、润下）
// 依据：《三命通会》"专旺者，五行独旺而无克泄，顺其旺势则吉，逆之则凶"
function checkZhuanwangPattern(bazi: { year: string; month: string; day: string; hour: string }, wuxingAnalysis: Record<string, number>): 
  { isPattern: boolean; name: string; condition: string; reference: string } | null {
  const dayGan = bazi.day[0];
  const dayWuxing = WUXING[TIANGAN.indexOf(dayGan)];
  
  // 获取地支五行统计
  const zhiWuxing: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]].forEach(zhi => {
    const wuxing = DIZHI_WUXING[DIZHI.indexOf(zhi)];
    zhiWuxing[wuxing]++;
  });
  
  const totalElements = Object.values(wuxingAnalysis).reduce((a, b) => a + b, 0);
  const dayWuxingCount = wuxingAnalysis[dayWuxing];
  const dayWuxingPercent = dayWuxingCount / totalElements;
  
  // 专旺格严格判定：日主五行占比≥60%，且无明显克泄（克泄五行总和<15%）
  if (dayWuxingPercent >= 0.6) {
    // 检查克泄之神的力量
    const keXieWuxing = getKeXieWuxing(dayWuxing);
    const keXiePercent = keXieWuxing.reduce((sum, wx) => sum + (wuxingAnalysis[wx] || 0), 0) / totalElements;
    
    // 克泄之神不能太强，否则不成专旺
    if (keXiePercent < 0.15) {
      const patterns: Record<string, { name: string; zhiCheck: () => boolean }> = {
        '木': { 
          name: '曲直格', 
          zhiCheck: () => {
            const zhi = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
            // 地支需有寅卯辰东方木局，或亥卯未三合木局
            return (zhi.includes('寅') && zhi.includes('卯')) ||
                   (zhi.includes('亥') && zhi.includes('卯') && zhi.includes('未')) ||
                   (zhi.filter(z => ['寅', '卯', '辰', '亥'].includes(z)).length >= 3);
          }
        },
        '火': { 
          name: '炎上格', 
          zhiCheck: () => {
            const zhi = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
            // 地支需有巳午未南方火局，或寅午戌三合火局
            return (zhi.includes('巳') && zhi.includes('午')) ||
                   (zhi.includes('寅') && zhi.includes('午') && zhi.includes('戌')) ||
                   (zhi.filter(z => ['巳', '午', '未', '寅'].includes(z)).length >= 3);
          }
        },
        '土': { 
          name: '稼穑格', 
          zhiCheck: () => {
            const zhi = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
            // 地支需有辰戌丑未四库土，或巳午未火土相生
            return (zhi.filter(z => ['辰', '戌', '丑', '未'].includes(z)).length >= 2) ||
                   (zhi.includes('巳') && zhi.includes('未'));
          }
        },
        '金': { 
          name: '从革格', 
          zhiCheck: () => {
            const zhi = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
            // 地支需有申酉戌西方金局，或巳酉丑三合金局
            return (zhi.includes('申') && zhi.includes('酉')) ||
                   (zhi.includes('巳') && zhi.includes('酉') && zhi.includes('丑')) ||
                   (zhi.filter(z => ['申', '酉', '戌', '巳'].includes(z)).length >= 3);
          }
        },
        '水': { 
          name: '润下格', 
          zhiCheck: () => {
            const zhi = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
            // 地支需有亥子丑北方水局，或申子辰三合水局
            return (zhi.includes('亥') && zhi.includes('子')) ||
                   (zhi.includes('申') && zhi.includes('子') && zhi.includes('辰')) ||
                   (zhi.filter(z => ['亥', '子', '丑', '申'].includes(z)).length >= 3);
          }
        }
      };
      
      if (patterns[dayWuxing] && patterns[dayWuxing].zhiCheck()) {
        return {
          isPattern: true,
          name: `专旺格（${patterns[dayWuxing].name}）`,
          condition: `${dayGan}${dayWuxing}日主，全局${dayWuxing}气独旺（占比${(dayWuxingPercent * 100).toFixed(0)}%），地支成局，无明显克泄（克泄仅${(keXiePercent * 100).toFixed(0)}%），顺势而发`,
          reference: '《三命通会》："专旺者，五行独旺而无克泄，顺其旺势则吉，逆之则凶"'
        };
      }
    }
  }
  
  return null;
}

// 获取克泄某五行的其他五行
function getKeXieWuxing(wuxing: string): string[] {
  const keXieMap: Record<string, string[]> = {
    '木': ['金', '火'],  // 金克木，火泄木
    '火': ['水', '土'],  // 水克火，土泄火
    '土': ['木', '金'],  // 木克土，金泄土
    '金': ['火', '水'],  // 火克金，水泄金
    '水': ['土', '木']   // 土克水，木泄水
  };
  return keXieMap[wuxing] || [];
}

// 判断从格（从财、从官杀、从印、从食伤）
// 依据：《滴天髓》"从势者，弃命而从人，不可执一己之见，当顺大势而行"
function checkCongPattern(bazi: { year: string; month: string; day: string; hour: string }, wuxingAnalysis: Record<string, number>):
  { isPattern: boolean; name: string; condition: string; reference: string } | null {
  const dayGan = bazi.day[0];
  const dayWuxing = WUXING[TIANGAN.indexOf(dayGan)];
  const dayZhi = bazi.day[1];
  
  const totalElements = Object.values(wuxingAnalysis).reduce((a, b) => a + b, 0);
  const dayWuxingPercent = wuxingAnalysis[dayWuxing] / totalElements;
  
  // 从格严格判定：日主极弱（占比≤20%），且日支不为根（不能是禄刃或长生帝旺）
  if (dayWuxingPercent <= 0.2) {
    // 检查日主是否在日支有根
    const luMaps: Record<string, string> = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
      '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
      '壬': '亥', '癸': '子'
    };
    const yangrenMaps: Record<string, string> = {
      '甲': '卯', '丙': '午', '戊': '午', '庚': '酉', '壬': '子'
    };
    
    // 日支为禄神或羊刃，则有强根，不能成从格
    const hasStrongRoot = luMaps[dayGan] === dayZhi || yangrenMaps[dayGan] === dayZhi;
    
    if (!hasStrongRoot) {
      // 找出主导的五行
      let maxWuxing = '木';
      let maxCount = 0;
      for (const [wx, count] of Object.entries(wuxingAnalysis)) {
        if (wx !== dayWuxing && count > maxCount) {
          maxCount = count;
          maxWuxing = wx;
        }
      }
      
      const maxPercent = maxCount / totalElements;
      // 主导五行需占比≥50%，形成绝对优势
      if (maxPercent >= 0.5) {
        // 根据十神判断从格类型
        const ganList = [bazi.year[0], bazi.month[0], bazi.day[0], bazi.hour[0]];
        const shishenList = ganList.map(g => getShishen(dayGan, g));
        
        let congType = '';
        let congDesc = '';
        
        const caiCount = shishenList.filter(s => s.includes('财')).length;
        const guanCount = shishenList.filter(s => s.includes('官') || s.includes('杀')).length;
        const yinCount = shishenList.filter(s => s.includes('印')).length;
        const shiCount = shishenList.filter(s => s.includes('食') || s.includes('伤')).length;
        
        if (caiCount >= 2) {
          congType = '从财格';
          congDesc = '从财利，宜经商求财';
        } else if (guanCount >= 2) {
          congType = '从杀格';
          congDesc = '从权势，宜公职管理';
        } else if (yinCount >= 2) {
          congType = '从印格';
          congDesc = '从学问，宜文化教育';
        } else if (shiCount >= 2) {
          congType = '从儿格';
          congDesc = '从秀气，宜艺术技能';
        } else {
          congType = '从势格';
          congDesc = '从大势，顺应环境发展';
        }
        
        if (congType) {
          return {
            isPattern: true,
            name: congType,
            condition: `${dayGan}${dayWuxing}日主极弱（占比${(dayWuxingPercent * 100).toFixed(0)}%），日支无强根，全局被${maxWuxing}气主导（占比${(maxPercent * 100).toFixed(0)}%），弃命从势，${congDesc}`,
            reference: '《滴天髓》："从势者，弃命而从人，不可执一己之见，当顺大势而行"'
          };
        }
      }
    }
  }
  
  return null;
}

// 判断化气格（甲己化土、乙庚化金、丙辛化水、丁壬化木、戊癸化火）
// 依据：《子平真诠》"化气者，日主与月令天干五合而化，需化神得令有力，方为真化"
function checkHuaqiPattern(bazi: { year: string; month: string; day: string; hour: string }, wuxingAnalysis: Record<string, number>):
  { isPattern: boolean; name: string; condition: string; reference: string } | null {
  const dayGan = bazi.day[0];
  const monthGan = bazi.month[0];
  const monthZhi = bazi.month[1];
  
  // 五合化气表
  const hehua: Record<string, { partner: string; huashen: string; seasonZhi: string[] }> = {
    '甲': { partner: '己', huashen: '土', seasonZhi: ['辰', '戌', '丑', '未'] },
    '己': { partner: '甲', huashen: '土', seasonZhi: ['辰', '戌', '丑', '未'] },
    '乙': { partner: '庚', huashen: '金', seasonZhi: ['申', '酉', '戌'] },
    '庚': { partner: '乙', huashen: '金', seasonZhi: ['申', '酉', '戌'] },
    '丙': { partner: '辛', huashen: '水', seasonZhi: ['亥', '子', '丑'] },
    '辛': { partner: '丙', huashen: '水', seasonZhi: ['亥', '子', '丑'] },
    '丁': { partner: '壬', huashen: '木', seasonZhi: ['寅', '卯', '辰'] },
    '壬': { partner: '丁', huashen: '木', seasonZhi: ['寅', '卯', '辰'] },
    '戊': { partner: '癸', huashen: '火', seasonZhi: ['巳', '午', '未'] },
    '癸': { partner: '戊', huashen: '火', seasonZhi: ['巳', '午', '未'] }
  };
  
  // 化气格必须日干与月干相合（最严格的真化条件）
  if (hehua[dayGan] && hehua[dayGan].partner === monthGan) {
    const huashen = hehua[dayGan].huashen;
    const seasonZhi = hehua[dayGan].seasonZhi;
    
    // 化神必须得令（月令为化神旺相之地）
    if (seasonZhi.includes(monthZhi)) {
      const totalElements = Object.values(wuxingAnalysis).reduce((a, b) => a + b, 0);
      const huashenPercent = wuxingAnalysis[huashen] / totalElements;
      
      // 化神必须有力（占比≥40%），且没有强力破化之神
      if (huashenPercent >= 0.4) {
        // 检查破化之神（克化神的五行）
        const pohuaWuxing = getPohuaWuxing(huashen);
        const pohuaPercent = pohuaWuxing.reduce((sum, wx) => sum + (wuxingAnalysis[wx] || 0), 0) / totalElements;
        
        // 破化之神不能超过20%
        if (pohuaPercent < 0.2) {
          return {
            isPattern: true,
            name: `化气格（${dayGan}${hehua[dayGan].partner}化${huashen}）`,
            condition: `日干${dayGan}与月干${monthGan}五合而化，月令${monthZhi}为${huashen}当令之地，化神${huashen}有力（占比${(huashenPercent * 100).toFixed(0)}%），无破化之神（仅${(pohuaPercent * 100).toFixed(0)}%），真化成格`,
            reference: '《子平真诠》："化气者，日主与月令天干五合而化，需化神得令有力，方为真化"'
          };
        }
      }
    }
  }
  
  return null;
}

// 获取破化某五行的其他五行（克制化神的五行）
function getPohuaWuxing(wuxing: string): string[] {
  const pohuaMap: Record<string, string[]> = {
    '木': ['金'],  // 金克木
    '火': ['水'],  // 水克火
    '土': ['木'],  // 木克土
    '金': ['火'],  // 火克金
    '水': ['土']   // 土克水
  };
  return pohuaMap[wuxing] || [];
}

// 判断魁罡格
// 依据：《渊海子平》"魁罡叠叠掌大权，性刚果断，不怒自威，宜武职军警"
function checkKuigangPattern(bazi: { year: string; month: string; day: string; hour: string }):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const dayPillar = bazi.day;
  const kuigangDays = ['庚辰', '壬辰', '戊戌', '庚戌'];
  
  if (kuigangDays.includes(dayPillar)) {
    const dayZhi = dayPillar[1];
    const allZhi = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
    const ganList = [bazi.year[0], bazi.month[0], bazi.day[0], bazi.hour[0]];
    
    // 地支六冲：子午、丑未、寅申、卯酉、辰戌、巳亥
    const chongPairs: Record<string, string> = {
      '子': '午', '午': '子', '丑': '未', '未': '丑',
      '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
      '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
    };
    
    // 检查是否有冲
    const hasChong = allZhi.some(zhi => zhi !== dayZhi && chongPairs[dayZhi] === zhi);
    
    // 检查是否有财星破格（魁罡忌见财）
    const dayGan = dayPillar[0];
    const shishenList = ganList.map(g => getShishen(dayGan, g));
    const hasCai = shishenList.some(s => s.includes('财'));
    
    // 魁罡格成格条件：无冲，且最好无财（财多则破格）
    if (!hasChong) {
      if (!hasCai) {
        return {
          isPattern: true,
          name: '魁罡格（纯格）',
          condition: `日柱为${dayPillar}（魁罡日），四柱无刑冲，天干不见财星，格局纯正，主性格刚毅果断，有领导才能，适合武职、执法、管理`,
          reference: '《渊海子平》："魁罡叠叠掌大权，性刚果断，不怒自威，宜武职军警"'
        };
      } else {
        return {
          isPattern: true,
          name: '魁罡格（见财）',
          condition: `日柱为${dayPillar}（魁罡日），四柱无刑冲，但天干见财星，格局稍减，仍主性格刚强，但宜文武兼修`,
          reference: '《渊海子平》："魁罡见财官，格局受损，宜文武并用"'
        };
      }
    }
  }
  
  return null;
}

// 判断日贵格
function checkRiguiPattern(bazi: { year: string; month: string; day: string; hour: string }):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const dayPillar = bazi.day;
  const riguiDays = ['丁酉', '丁亥', '癸巳', '癸卯'];
  
  if (riguiDays.includes(dayPillar)) {
    // 检查天干是否有官杀混杂
    const dayGan = dayPillar[0];
    const ganList = [bazi.year[0], bazi.month[0], bazi.hour[0]];
    const shishenList = ganList.map(g => getShishen(dayGan, g));
    
    const hasZhengguan = shishenList.includes('正官');
    const hasQisha = shishenList.includes('七杀');
    
    if (!(hasZhengguan && hasQisha)) {
      return {
        isPattern: true,
        name: '日贵格',
        condition: `日柱为${dayPillar}（日坐贵人），天干无官杀混杂，贵人运佳`,
        reference: '《三命通会》："日贵者，自坐天乙贵人也，主聪明智慧，贵人扶持"'
      };
    }
  }
  
  return null;
}

// 判断金神格
function checkJinshenPattern(bazi: { year: string; month: string; day: string; hour: string }):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const dayPillar = bazi.day;
  const jinshenDays = ['乙丑', '己巳', '癸酉'];
  
  if (jinshenDays.includes(dayPillar)) {
    return {
      isPattern: true,
      name: '金神格',
      condition: `日柱为${dayPillar}（金神格），性格刚烈，适合武职或技术专长`,
      reference: '《三命通会》："金神格者，日柱乙丑、己巳、癸酉也，主性格刚强"'
    };
  }
  
  return null;
}

// 判断井栏叉格（庚申、庚辰日柱，时柱也为庚申或庚辰）
function checkJinglanchaPattern(bazi: { year: string; month: string; day: string; hour: string }):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const dayPillar = bazi.day;
  const hourPillar = bazi.hour;
  
  if ((dayPillar === '庚申' || dayPillar === '庚辰') && 
      (hourPillar === '庚申' || hourPillar === '庚辰')) {
    return {
      isPattern: true,
      name: '井栏叉格',
      condition: `日柱${dayPillar}，时柱${hourPillar}，形成井栏叉格，主才智过人，适合技术研究`,
      reference: '《三命通会》："庚日庚时，两重庚申或庚辰，如井栏之交叉，主聪明有谋略"'
    };
  }
  
  return null;
}

// 判断天德贵人格/月德贵人格
function checkTianyueerdePattern(bazi: { year: string; month: string; day: string; hour: string }):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const monthZhi = bazi.month[1];
  const ganList = [bazi.year[0], bazi.month[0], bazi.day[0], bazi.hour[0]];
  const zhiList = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
  
  // 天德贵人（按月支查天干）
  const tiandeMaps: Record<string, string[]> = {
    '子': ['丁'], '丑': ['申'], '寅': ['壬'], '卯': ['辛'],
    '辰': ['亥'], '巳': ['甲'], '午': ['癸'], '未': ['寅'],
    '申': ['乙'], '酉': ['戊'], '戌': ['丙'], '亥': ['己']
  };
  
  // 月德贵人（按月支查天干/地支）
  const yuedeMaps: Record<string, string[]> = {
    '寅': ['丙'], '午': ['丙'], '戌': ['丙'],
    '亥': ['甲'], '卯': ['甲'], '未': ['甲'],
    '申': ['庚'], '子': ['庚'], '辰': ['庚'],
    '巳': ['壬'], '酉': ['壬'], '丑': ['壬']
  };
  
  const hasTiande = tiandeMaps[monthZhi]?.some(td => {
    if (td.length === 1) return ganList.includes(td);
    return zhiList.includes(td);
  });
  
  const hasYuede = yuedeMaps[monthZhi]?.some(yd => ganList.includes(yd));
  
  if (hasTiande && hasYuede) {
    return {
      isPattern: true,
      name: '天月二德格',
      condition: `月支${monthZhi}，四柱有天德、月德贵人，一生多得贵人相助，逢凶化吉`,
      reference: '《三命通会》："天月二德，乃天地德秀之气，命中有之，主性格仁慈，遇祸不凶"'
    };
  } else if (hasTiande) {
    return {
      isPattern: true,
      name: '天德贵人格',
      condition: `月支${monthZhi}，四柱有天德贵人，得天之庇佑，化险为夷`,
      reference: '《三命通会》："天德者，天地造化之德，命中逢之，多福少祸"'
    };
  } else if (hasYuede) {
    return {
      isPattern: true,
      name: '月德贵人格',
      condition: `月支${monthZhi}，四柱有月德贵人，性情温和，贵人运佳`,
      reference: '《三命通会》："月德者，三合之德，命中见之，多得人助"'
    };
  }
  
  return null;
}

// 判断三奇格（天上三奇：甲戊庚，地下三奇：乙丙丁，人中三奇：壬癸辛）
function checkSanqiPattern(bazi: { year: string; month: string; day: string; hour: string }):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const ganList = [bazi.year[0], bazi.month[0], bazi.day[0], bazi.hour[0]];
  
  const hasTianshangSanqi = ['甲', '戊', '庚'].every(g => ganList.includes(g));
  const hasDixiaSanqi = ['乙', '丙', '丁'].every(g => ganList.includes(g));
  const hasRenzhongSanqi = ['壬', '癸', '辛'].every(g => ganList.includes(g));
  
  if (hasTianshangSanqi) {
    return {
      isPattern: true,
      name: '三奇格（天上三奇）',
      condition: '四柱天干有甲、戊、庚三奇，主文武兼备，事业有成',
      reference: '《三命通会》："甲戊庚为天上三奇，主贵显，文武双全"'
    };
  } else if (hasDixiaSanqi) {
    return {
      isPattern: true,
      name: '三奇格（地下三奇）',
      condition: '四柱天干有乙、丙、丁三奇，主聪明秀丽，才华横溢',
      reference: '《三命通会》："乙丙丁为地下三奇，主聪慧，多艺多才"'
    };
  } else if (hasRenzhongSanqi) {
    return {
      isPattern: true,
      name: '三奇格（人中三奇）',
      condition: '四柱天干有壬、癸、辛三奇，主智谋深远，善于权变',
      reference: '《三命通会》："壬癸辛为人中三奇，主智慧过人，多谋善断"'
    };
  }
  
  return null;
}

// 判断羊刃格（日主强旺，地支见羊刃）
function checkYanggrenPattern(bazi: { year: string; month: string; day: string; hour: string }, wuxingAnalysis: Record<string, number>):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const dayGan = bazi.day[0];
  const zhiList = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
  
  // 羊刃对照表
  const yangrenMaps: Record<string, string> = {
    '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳',
    '戊': '午', '己': '巳', '庚': '酉', '辛': '申',
    '壬': '子', '癸': '亥'
  };
  
  const yangrenZhi = yangrenMaps[dayGan];
  if (yangrenZhi && zhiList.includes(yangrenZhi)) {
    const dayWuxing = WUXING[TIANGAN.indexOf(dayGan)];
    const totalElements = Object.values(wuxingAnalysis).reduce((a, b) => a + b, 0);
    const dayWuxingPercent = wuxingAnalysis[dayWuxing] / totalElements;
    
    // 羊刃格需要日主较旺
    if (dayWuxingPercent >= 0.35) {
      return {
        isPattern: true,
        name: '羊刃格',
        condition: `${dayGan}日主，地支见${yangrenZhi}（羊刃），日主强旺，性格刚毅果断，需制化得宜`,
        reference: '《三命通会》："羊刃者，劫财之神，日主旺而见之，主性格刚强，勇猛果断"'
      };
    }
  }
  
  return null;
}

// 判断建禄格（月支为日主禄神）
function checkJianluPattern(bazi: { year: string; month: string; day: string; hour: string }):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const dayGan = bazi.day[0];
  const monthZhi = bazi.month[1];
  
  // 禄神对照表（地支见日主的临官位）
  const luMaps: Record<string, string> = {
    '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
    '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
    '壬': '亥', '癸': '子'
  };
  
  if (luMaps[dayGan] === monthZhi) {
    return {
      isPattern: true,
      name: '建禄格',
      condition: `${dayGan}日主，月支${monthZhi}为禄神，主身强体健，自力更生，适合靠技能立足`,
      reference: '《三命通会》："建禄格者，月支为日主禄神，主身强力壮，自食其力，贵在独立"'
    };
  }
  
  return null;
}

// 判断两神成象格（两种五行极旺，形成对峙）
function checkLiangshenPattern(bazi: { year: string; month: string; day: string; hour: string }, wuxingAnalysis: Record<string, number>):
  { isPattern: true; name: string; condition: string; reference: string } | null {
  const totalElements = Object.values(wuxingAnalysis).reduce((a, b) => a + b, 0);
  const wuxingPercents = Object.entries(wuxingAnalysis)
    .map(([wx, count]) => ({ wx, percent: count / totalElements }))
    .filter(item => item.percent >= 0.3)
    .sort((a, b) => b.percent - a.percent);
  
  // 两神成象：两种五行各占30%以上，其他五行极弱
  if (wuxingPercents.length === 2) {
    const [first, second] = wuxingPercents;
    const totalPercent = first.percent + second.percent;
    
    if (totalPercent >= 0.75) {
      return {
        isPattern: true,
        name: '两神成象格',
        condition: `八字由${first.wx}（${(first.percent * 100).toFixed(0)}%）、${second.wx}（${(second.percent * 100).toFixed(0)}%）两种五行主导，其他五行微弱，格局纯正`,
        reference: '《滴天髓》："两神成象，清而不浊，贵在专一，忌神搅局"'
      };
    }
  }
  
  return null;
}

// 综合分析特殊格局
function analyzeSpecialPatterns(bazi: { year: string; month: string; day: string; hour: string }, wuxingAnalysis: Record<string, number>):
  { specialPatterns: Array<{ name: string; condition: string; reference: string; isPrimary: boolean }>; hasSpecialPattern: boolean } {
  
  const patterns: Array<{ name: string; condition: string; reference: string; isPrimary: boolean }> = [];
  
  // 第一优先级：专旺格和从格（互斥，优先专旺格）
  const zhuanwang = checkZhuanwangPattern(bazi, wuxingAnalysis);
  if (zhuanwang?.isPattern) {
    patterns.push({ ...zhuanwang, isPrimary: true });
  } else {
    const cong = checkCongPattern(bazi, wuxingAnalysis);
    if (cong?.isPattern) {
      patterns.push({ ...cong, isPrimary: true });
    }
  }
  
  // 第二优先级：化气格（可与其他格局共存，但作为主格）
  const huaqi = checkHuaqiPattern(bazi, wuxingAnalysis);
  if (huaqi?.isPattern) {
    patterns.push({ ...huaqi, isPrimary: patterns.length === 0 });
  }
  
  // 第三优先级：两神成象格
  const liangshen = checkLiangshenPattern(bazi, wuxingAnalysis);
  if (liangshen?.isPattern) {
    patterns.push({ ...liangshen, isPrimary: patterns.length === 0 });
  }
  
  // 第四优先级：日柱特殊格局（魁罡、日贵、金神、井栏叉）
  const kuigang = checkKuigangPattern(bazi);
  if (kuigang?.isPattern) {
    patterns.push({ ...kuigang, isPrimary: patterns.length === 0 });
  }
  
  const rigui = checkRiguiPattern(bazi);
  if (rigui?.isPattern) {
    patterns.push({ ...rigui, isPrimary: patterns.length === 0 });
  }
  
  const jinshen = checkJinshenPattern(bazi);
  if (jinshen?.isPattern) {
    patterns.push({ ...jinshen, isPrimary: patterns.length === 0 });
  }
  
  const jinglancha = checkJinglanchaPattern(bazi);
  if (jinglancha?.isPattern) {
    patterns.push({ ...jinglancha, isPrimary: patterns.length === 0 });
  }
  
  // 第五优先级：建禄格、羊刃格（与日主强弱相关）
  const jianlu = checkJianluPattern(bazi);
  if (jianlu?.isPattern) {
    patterns.push({ ...jianlu, isPrimary: patterns.length === 0 });
  }
  
  const yanggren = checkYanggrenPattern(bazi, wuxingAnalysis);
  if (yanggren?.isPattern) {
    patterns.push({ ...yanggren, isPrimary: patterns.length === 0 });
  }
  
  // 第六优先级：贵人格局（天月二德、三奇）
  const tianyueerde = checkTianyueerdePattern(bazi);
  if (tianyueerde?.isPattern) {
    patterns.push({ ...tianyueerde, isPrimary: patterns.length === 0 });
  }
  
  const sanqi = checkSanqiPattern(bazi);
  if (sanqi?.isPattern) {
    patterns.push({ ...sanqi, isPrimary: patterns.length === 0 });
  }
  
  return {
    specialPatterns: patterns,
    hasSpecialPattern: patterns.length > 0
  };
}

// 判断普通格局（用于无特殊格局时）
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

    // 特殊格局识别
    const specialPatternsResult = analyzeSpecialPatterns(bazi, wuxingAnalysis);

    // 普通格局判断（无特殊格局时使用）
    const normalPattern = analyzePattern(bazi);
    
    // 最终格局（优先特殊格局）
    const pattern = specialPatternsResult.hasSpecialPattern ? {
      pattern: specialPatternsResult.specialPatterns.filter(p => p.isPrimary)[0]?.name || specialPatternsResult.specialPatterns[0].name,
      description: specialPatternsResult.specialPatterns.filter(p => p.isPrimary)[0]?.condition || specialPatternsResult.specialPatterns[0].condition,
      isSpecial: true,
      allPatterns: specialPatternsResult.specialPatterns
    } : {
      pattern: normalPattern.pattern,
      description: normalPattern.description,
      isSpecial: false,
      allPatterns: []
    };

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
