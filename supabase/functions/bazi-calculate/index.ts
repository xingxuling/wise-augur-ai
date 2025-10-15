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

// 地域经纬度（用于真太阳时修正）
const CITY_LONGITUDE: Record<string, number> = {
  '北京': 116.4, '上海': 121.5, '广州': 113.3, '深圳': 114.1,
  '成都': 104.1, '杭州': 120.2, '重庆': 106.5, '西安': 108.9
};

// 计算真太阳时修正（分钟）
function getTrueSolarTimeCorrection(longitude: number, standardLongitude = 120): number {
  return Math.round((longitude - standardLongitude) * 4);
}

// 计算年柱
function getYearGanZhi(year: number) {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}

// 计算月柱（简化算法）
function getMonthGanZhi(year: number, month: number) {
  const yearGan = (year - 4) % 10;
  const monthGanBase = (yearGan % 5) * 2;
  const ganIndex = (monthGanBase + month - 1) % 10;
  const zhiIndex = (month + 1) % 12;
  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}

// 计算日柱（简化算法 - 实际应使用万年历）
function getDayGanZhi(year: number, month: number, day: number) {
  // 简化计算，实际生产环境应使用精确的万年历数据
  const baseDate = new Date(1900, 0, 1);
  const currentDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const ganIndex = (daysDiff + 9) % 10;
  const zhiIndex = (daysDiff + 9) % 12;
  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}

// 计算时柱
function getHourGanZhi(dayGan: string, hour: number, minute: number) {
  const dayGanIndex = TIANGAN.indexOf(dayGan);
  const totalMinutes = hour * 60 + minute;
  const hourZhiIndex = Math.floor((totalMinutes + 60) / 120) % 12;
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
function analyzeDayMasterStrength(bazi: { year: string; month: string; day: string; hour: string }, birthMonth: number): string {
  const dayGan = bazi.day[0];
  const dayWuxing = WUXING[TIANGAN.indexOf(dayGan)];
  
  // 简化判断：根据月令和五行数量
  const monthZhi = bazi.month[1];
  const monthZhiWuxing = DIZHI_WUXING[DIZHI.indexOf(monthZhi)];
  
  const isBornInSeason = dayWuxing === monthZhiWuxing;
  
  return isBornInSeason ? '日主较旺' : '日主较弱';
}

// 判断格局（简化版）
function analyzePattern(bazi: { year: string; month: string; day: string; hour: string }): { pattern: string; description: string } {
  const dayGan = bazi.day[0];
  const monthGan = bazi.month[0];
  const yearGan = bazi.year[0];
  const hourGan = bazi.hour[0];
  
  const monthShishen = getShishen(dayGan, monthGan);
  
  const patterns: Record<string, string> = {
    '正官': '正官格：为人正直，适合从事稳定职业',
    '七杀': '七杀格：性格刚毅，需注意处理压力',
    '正财': '正财格：财运稳健，理财观念强',
    '偏财': '偏财格：善于把握机会，财运多变',
    '食神': '食神格：性格温和，有艺术天赋',
    '伤官': '伤官格：思维活跃，需注意沟通方式',
    '正印': '正印格：学习能力强，适合学术研究',
    '偏印': '偏印格：思维独特，多才多艺'
  };
  
  return {
    pattern: monthShishen,
    description: patterns[monthShishen] || '命格特殊，需综合分析'
  };
}

// 判断用神（简化版）
function analyzeYongshen(wuxingAnalysis: Record<string, number>, birthMonth: number): { yongshen: string; description: string } {
  // 找出最弱的五行作为用神（简化逻辑）
  let minWuxing = '木';
  let minCount = wuxingAnalysis['木'];
  
  for (const [wuxing, count] of Object.entries(wuxingAnalysis)) {
    if (count < minCount) {
      minCount = count;
      minWuxing = wuxing;
    }
  }
  
  const descriptions: Record<string, string> = {
    '木': '用神为木，建议多接触绿色、木质物品，有利于运势平衡',
    '火': '用神为火，建议多接触红色系事物，注意保持热情积极',
    '土': '用神为土，建议多接触黄色、土系物品，增强稳定性',
    '金': '用神为金，建议多接触白色、金属物品，提升决断力',
    '水': '用神为水，建议多接触黑色、蓝色事物，增强灵活性'
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
    // 地支的五行属性（简化）
    const zhiWuxing = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
    if (zhiIndex !== -1) {
      wuxingCount[zhiWuxing[zhiIndex]]++;
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

    const { birthYear, birthMonth, birthDay, birthHour, birthMinute = 0, gender, city = '北京' } = await req.json();

    // 输入验证
    if (!birthYear || !birthMonth || !birthDay || birthHour === undefined) {
      throw new Error('缺少必要的生辰信息');
    }

    if (birthYear < 1900 || birthYear > 2100) {
      throw new Error('年份无效');
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
    const cityLongitude = CITY_LONGITUDE[city] || 116.4;
    const trueSolarCorrection = getTrueSolarTimeCorrection(cityLongitude);
    const correctedMinutes = birthHour * 60 + birthMinute + trueSolarCorrection;
    const correctedHour = Math.floor(correctedMinutes / 60) % 24;
    const correctedMinute = correctedMinutes % 60;

    // 计算八字
    const yearGanZhi = getYearGanZhi(birthYear);
    const monthGanZhi = getMonthGanZhi(birthYear, birthMonth);
    const dayGanZhi = getDayGanZhi(birthYear, birthMonth, birthDay);
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
    const dayMasterStrength = analyzeDayMasterStrength(bazi, birthMonth);

    // 格局判断
    const pattern = analyzePattern(bazi);

    // 用神分析
    const yongshen = analyzeYongshen(wuxingAnalysis, birthMonth);

    const result = {
      bazi,
      wuxingAnalysis,
      lackingWuxing,
      shishenAnalysis,
      dayMasterStrength,
      pattern,
      yongshen,
      trueSolarTime: {
        original: { hour: birthHour, minute: birthMinute },
        corrected: { hour: correctedHour, minute: correctedMinute },
        correction: trueSolarCorrection,
        city: city,
        note: `根据${city}地理位置，真太阳时修正约${trueSolarCorrection}分钟`
      },
      birthInfo: {
        year: birthYear,
        month: birthMonth,
        day: birthDay,
        hour: birthHour,
        minute: birthMinute,
        city: city
      },
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
