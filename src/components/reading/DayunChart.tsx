import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DayunChartProps {
  baziData: any;
  gender: 'male' | 'female';
  birthYear: number;
}

// 计算大运（基于月柱正确排法）
const calculateDayun = (
  monthPillar: string,
  yearPillar: string, 
  gender: 'male' | 'female',
  birthYear: number
) => {
  // 天干地支
  const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 获取年干判断阴阳年
  const yearGan = yearPillar[0];
  const yangGans = ['甲', '丙', '戊', '庚', '壬'];
  const isYangYear = yangGans.includes(yearGan);
  
  // 男阳女阴顺行，男阴女阳逆行
  const shunxing = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);
  
  // 获取月柱的天干地支索引
  const monthGan = monthPillar[0];
  const monthZhi = monthPillar[1];
  let ganIndex = tiangan.indexOf(monthGan);
  let zhiIndex = dizhi.indexOf(monthZhi);
  
  if (ganIndex === -1 || zhiIndex === -1) {
    console.error('月柱格式错误:', monthPillar);
    return [];
  }
  
  const dayuns = [];
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;
  
  // 起运岁数（简化为9岁，1-8岁为小运阶段）
  // 实际应根据出生日距离节气的天数计算，顺逆行各3天折1年
  const qiyunAge = 9;
  
  // 生成10步大运
  for (let i = 0; i < 10; i++) {
    // 从月柱的下一个（顺行）或上一个（逆行）干支开始
    if (shunxing) {
      // 顺行：天干地支各加1
      ganIndex = (ganIndex + 1) % 10;
      zhiIndex = (zhiIndex + 1) % 12;
    } else {
      // 逆行：天干地支各减1
      ganIndex = (ganIndex - 1 + 10) % 10;
      zhiIndex = (zhiIndex - 1 + 12) % 12;
    }
    
    const startAge = qiyunAge + i * 10;
    const endAge = startAge + 9;
    const startYear = birthYear + startAge;
    const endYear = birthYear + endAge;
    
    // 简化的吉凶判断（实际需要结合八字格局和用神）
    let trend: '吉' | '平' | '凶';
    // 基于地支与日主关系简单判断
    const beneficialZhi = ['寅', '卯', '巳', '午', '申', '酉'];
    if (beneficialZhi.includes(dizhi[zhiIndex])) {
      trend = i % 3 === 0 ? '吉' : '平';
    } else {
      trend = i % 3 === 2 ? '凶' : '平';
    }
    
    dayuns.push({
      ganZhi: tiangan[ganIndex] + dizhi[zhiIndex],
      startAge,
      endAge,
      startYear,
      endYear,
      trend,
      description: getTrendDescription(trend),
      direction: shunxing ? '顺行' : '逆行',
    });
  }
  
  return dayuns;
};

const getTrendDescription = (trend: string) => {
  switch (trend) {
    case '吉':
      return '运势上升，利于发展';
    case '凶':
      return '需谨慎行事，防范风险';
    default:
      return '运势平稳，保持状态';
  }
};

export const DayunChart = ({ baziData, gender, birthYear }: DayunChartProps) => {
  if (!baziData?.bazi?.month || !baziData?.bazi?.year) {
    return null;
  }

  const dayuns = calculateDayun(
    baziData.bazi.month, 
    baziData.bazi.year, 
    gender, 
    birthYear
  );
  const currentYear = new Date().getFullYear();

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">大运流年图表</h3>
        <p className="text-sm text-muted-foreground">
          展示10步大运的走势预测，每步大运10年
          {dayuns.length > 0 && ` (${dayuns[0].direction})`}
        </p>
      </div>

      {/* 时间轴 */}
      <div className="space-y-4">
        {dayuns.map((dayun, index) => {
          const isCurrent = currentYear >= dayun.startYear && currentYear <= dayun.endYear;
          
          return (
            <div
              key={index}
              className={`relative p-4 rounded-lg border transition-all ${
                isCurrent
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 大运干支 */}
                  <div className={`text-2xl font-bold ${
                    isCurrent ? 'text-primary' : 'text-foreground'
                  }`}>
                    {dayun.ganZhi}
                  </div>
                  
                  {/* 年龄范围 */}
                  <div className="text-sm text-muted-foreground">
                    <div>{dayun.startAge}-{dayun.endAge}岁</div>
                    <div className="text-xs">
                      {dayun.startYear}-{dayun.endYear}年
                    </div>
                  </div>
                  
                  {/* 当前运势标记 */}
                  {isCurrent && (
                    <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                      当前大运
                    </div>
                  )}
                </div>
                
                {/* 趋势指示 */}
                <div className="flex items-center gap-3">
                  <div className={`text-sm ${
                    dayun.trend === '吉' ? 'text-green-500' :
                    dayun.trend === '凶' ? 'text-red-500' :
                    'text-yellow-500'
                  }`}>
                    {dayun.description}
                  </div>
                  
                  {dayun.trend === '吉' && <TrendingUp className="w-5 h-5 text-green-500" />}
                  {dayun.trend === '凶' && <TrendingDown className="w-5 h-5 text-red-500" />}
                  {dayun.trend === '平' && <Minus className="w-5 h-5 text-yellow-500" />}
                </div>
              </div>
              
              {/* 进度条 */}
              {isCurrent && (
                <div className="mt-3">
                  <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${((currentYear - dayun.startYear) / 10) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    已行{currentYear - dayun.startYear}年，还剩{dayun.endYear - currentYear}年
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 说明 */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">大运说明：</strong>
          大运从月柱起排，阳男阴女顺行，阴男阳女逆行，每步大运管10年。
          起运前1-8岁走小运，9岁起进入第一步大运（实际起运岁数应根据出生日距离节气天数计算，顺逆行各3天折1年）。
          大运的吉凶判断需结合八字格局、用神喜忌等多方面因素综合分析，本图表仅供参考。
        </p>
      </div>
    </Card>
  );
};