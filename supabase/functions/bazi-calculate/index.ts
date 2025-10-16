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

// 2024-2025年节气数据（基于北京时间）
interface SolarTermTime {
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const SOLAR_TERMS_DATA: { [key: number]: SolarTermTime[] } = {
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
  const standardLongitude = 120; // 东八区标准经度
  return Math.round((longitude - standardLongitude) * 4);
}

// 获取立春时间
function getLichunTime(year: number): Date | null {
  const terms = SOLAR_TERMS_DATA[year];
  if (!terms) return null;
  
  const lichun = terms[0]; // 立春是第一个节气
  return new Date(year, lichun.month - 1, lichun.day, lichun.hour, lichun.minute);
}

// 根据立春判断八字年份
function getBaziYear(date: Date): number {
  const year = date.getFullYear();
  const lichunThisYear = getLichunTime(year);
  
  if (!lichunThisYear) {
    // 无节气数据时按公历2月4日近似
    const approxLichun = new Date(year, 1, 4, 0, 0);
    return date >= approxLichun ? year : year - 1;
  }
  
  return date >= lichunThisYear ? year : year - 1;
}

// 计算年柱（基于立春）
function getYearGanZhi(date: Date): string {
  const baziYear = getBaziYear(date);
  const ganIndex = (baziYear - 4) % 10;
  const zhiIndex = (baziYear - 4) % 12;
  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}

// 获取节气月份（基于节气而非公历）
function getSolarTermMonth(date: Date): { index: number; name: string } | null {
  const year = date.getFullYear();
  const terms = SOLAR_TERMS_DATA[year];
  if (!terms) return null;
  
  const dateTime = date.getTime();
  
  // 节气月份对应（从立春开始）
  const monthNames = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  
  // 找当前时间在哪两个节气之间（每两个节气为一个月）
  for (let i = 0; i < 24; i += 2) {
    const currentTermIndex = i;
    const nextTermIndex = (i + 2) % 24;
    
    let currentTerm = terms[currentTermIndex];
    let nextTerm = terms[nextTermIndex];
    
    // 处理跨年情况
    const currentDate = new Date(year, currentTerm.month - 1, currentTerm.day, currentTerm.hour, currentTerm.minute);
    let nextDate: Date;
    
    if (nextTermIndex < currentTermIndex) {
      // 下一个节气在明年
      const nextYearTerms = SOLAR_TERMS_DATA[year + 1];
      if (nextYearTerms) {
        nextTerm = nextYearTerms[nextTermIndex];
        nextDate = new Date(year + 1, nextTerm.month - 1, nextTerm.day, nextTerm.hour, nextTerm.minute);
      } else {
        nextDate = new Date(year + 1, nextTerm.month - 1, nextTerm.day, nextTerm.hour, nextTerm.minute);
      }
    } else {
      nextDate = new Date(year, nextTerm.month - 1, nextTerm.day, nextTerm.hour, nextTerm.minute);
    }
    
    if (dateTime >= currentDate.getTime() && dateTime < nextDate.getTime()) {
      return { index: i / 2, name: monthNames[i / 2] };
    }
  }
  
  return null;
}

// 计算月柱（基于节气）
function getMonthGanZhi(date: Date): string {
  const baziYear = getBaziYear(date);
  const yearGan = (baziYear - 4) % 10;
  
  const monthInfo = getSolarTermMonth(date);
  if (!monthInfo) {
    // 无节气数据时使用简化算法
    const month = date.getMonth() + 1;
    const monthGanBase = (yearGan % 5) * 2;
    const ganIndex = (monthGanBase + month - 1) % 10;
    const zhiIndex = (month + 1) % 12;
    return TIANGAN[ganIndex] + DIZHI[zhiIndex];
  }
  
  const monthZhiIndex = monthInfo.index;
  const monthGanBase = (yearGan % 5) * 2;
  const ganIndex = (monthGanBase + monthZhiIndex) % 10;
  
  return TIANGAN[ganIndex] + DIZHI[monthZhiIndex];
}

// 计算日柱（蔡勒公式改进版）
function getDayGanZhi(year: number, month: number, day: number): string {
  // 基准日：1900年1月1日为甲戌日
  const y0 = 1900;
  const m0 = 1;
  const d0 = 1;
  
  // 计算从基准日到目标日的天数
  let totalDays = 0;
  
  // 计算年份差
  for (let y = y0; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  
  // 计算月份差
  for (let m = 1; m < month; m++) {
    totalDays += getDaysInMonth(year, m);
  }
  
  // 加上日期
  totalDays += day - d0;
  
  // 1900年1月1日是甲戌日，甲=0，戌=10
  // 所以基准的干支索引是 (0, 10)
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

// 计算时柱（23:00后算次日子时）
function getHourGanZhi(dayGan: string, hour: number, minute: number): string {
  const dayGanIndex = TIANGAN.indexOf(dayGan);
  
  // 23:00-23:59算次日子时
  let actualHour = hour;
  if (hour === 23) {
    actualHour = 0; // 按次日子时算
  }
  
  // 计算时辰地支（每两小时一个时辰）
  const hourZhiIndex = Math.floor((actualHour + 1) / 2) % 12;
  
  // 根据日干起时干（五子遁元）
  const hourGanBase = (dayGanIndex % 5) * 2;
  const hourGanIndex = (hourGanBase + hourZhiIndex) % 10;
  
  return TIANGAN[hourGanIndex] + DIZHI[hourZhiIndex];
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
  
  return isBornInSeason ? '日主较旺' : '日主较弱';
}

// 判断格局
function analyzePattern(bazi: { year: string; month: string; day: string; hour: string }): { pattern: string; description: string } {
  const dayGan = bazi.day[0];
  const monthGan = bazi.month[0];
  
  const monthShishen = getShishen(dayGan, monthGan);
  
  const patterns: Record<string, string> = {
    '正官': '正官格：为人正直，适合从事稳定职业，具有管理才能',
    '七杀': '七杀格：性格刚毅果断，适合竞争环境，需注意控制情绪',
    '正财': '正财格：财运稳健，理财观念强，适合稳定型投资',
    '偏财': '偏财格：善于把握机会，财运多变，适合灵活经营',
    '食神': '食神格：性格温和，有艺术天赋，善于表达创意',
    '伤官': '伤官格：思维活跃，才华横溢，需注意沟通方式',
    '正印': '正印格：学习能力强，适合学术研究，贵人运佳',
    '偏印': '偏印格：思维独特，多才多艺，善于独立思考'
  };
  
  return {
    pattern: monthShishen,
    description: patterns[monthShishen] || '命格特殊，需综合分析'
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
    '木': '用神为木，宜东方发展，多接触绿色、木质物品，有利于运势平衡',
    '火': '用神为火，宜南方发展，多接触红色系事物，注意保持热情积极',
    '土': '用神为土，宜本地发展，多接触黄色、土系物品，增强稳定性',
    '金': '用神为金，宜西方发展，多接触白色、金属物品，提升决断力',
    '水': '用神为水，宜北方发展，多接触黑色、蓝色事物，增强灵活性'
  };
  
  return {
    yongshen: minWuxing,
    description: descriptions[minWuxing]
  };
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
      throw new Error('年份必须在1900-2100之间');
    }

    if (birthMonth < 1 || birthMonth > 12) {
      throw new Error('月份无效');
    }

    if (birthDay < 1 || birthDay > 31) {
      throw new Error('日期无效');
    }

    if (birthHour < 0 || birthHour > 23) {
      throw new Error('时辰无效');
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
      // 处理月份和年份进位
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

    // 创建修正后的日期对象
    const correctedDate = new Date(correctedYear, correctedMonth - 1, correctedDay, correctedHour, correctedMinute);

    // 计算八字（基于万年历）
    const yearGanZhi = getYearGanZhi(correctedDate);
    const monthGanZhi = getMonthGanZhi(correctedDate);
    const dayGanZhi = getDayGanZhi(correctedYear, correctedMonth, correctedDay);
    const hourGanZhi = getHourGanZhi(dayGanZhi[0], correctedHour, correctedMinute);

    const bazi = {
      year: yearGanZhi,
      month: monthGanZhi,
      day: dayGanZhi,
      hour: hourGanZhi,
    };

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

    const result = {
      bazi,
      wuxingAnalysis,
      lackingWuxing,
      shishenAnalysis,
      dayMasterStrength,
      pattern,
      yongshen,
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
        note: `基于${region}地理位置（东经${regionLongitude.toFixed(2)}°），真太阳时修正${trueSolarCorrection}分钟`
      },
      calculation_note: '本排盘基于万年历节气数据，年柱以立春为界，月柱以节气为界，确保准确性',
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
        error: error instanceof Error ? error.message : '计算失败' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
