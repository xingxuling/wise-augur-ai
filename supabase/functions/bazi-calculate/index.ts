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
function getHourGanZhi(dayGan: string, hour: number) {
  const dayGanIndex = TIANGAN.indexOf(dayGan);
  const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
  const hourGanBase = (dayGanIndex % 5) * 2;
  const hourGanIndex = (hourGanBase + hourZhiIndex) % 10;
  
  return TIANGAN[hourGanIndex] + DIZHI[hourZhiIndex];
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

    const { birthYear, birthMonth, birthDay, birthHour, gender } = await req.json();

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

    // 计算八字
    const yearGanZhi = getYearGanZhi(birthYear);
    const monthGanZhi = getMonthGanZhi(birthYear, birthMonth);
    const dayGanZhi = getDayGanZhi(birthYear, birthMonth, birthDay);
    const hourGanZhi = getHourGanZhi(dayGanZhi[0], birthHour);

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

    const result = {
      bazi,
      wuxingAnalysis,
      lackingWuxing,
      birthInfo: {
        year: birthYear,
        month: birthMonth,
        day: birthDay,
        hour: birthHour,
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
