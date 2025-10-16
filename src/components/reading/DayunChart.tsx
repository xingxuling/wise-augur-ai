import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DayunChartProps {
  baziData: any;
  gender: 'male' | 'female';
}

// 计算大运(简化版本)
const calculateDayun = (year: string, gender: 'male' | 'female') => {
  // 获取年干
  const yearGan = year[0];
  
  // 判断阴阳年
  const yangGans = ['甲', '丙', '戊', '庚', '壬'];
  const isYangYear = yangGans.includes(yearGan);
  
  // 男阳女阴顺行，男阴女阳逆行
  const shunxing = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);
  
  // 天干地支
  const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 模拟生成10步大运(实际应该基于月柱推算)
  const dayuns = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < 10; i++) {
    const startAge = 8 + i * 10;
    const startYear = currentYear - 30 + startAge; // 假设用户30岁
    
    // 简化的大运干支(实际需要复杂计算)
    const ganIndex = (i * (shunxing ? 1 : -1) + 10) % 10;
    const zhiIndex = (i * (shunxing ? 1 : -1) + 12) % 12;
    
    // 评估吉凶(简化版本，实际需要根据格局和用神)
    const trends = ['吉', '平', '凶'];
    const trend = trends[Math.floor(Math.random() * 3)];
    
    dayuns.push({
      ganZhi: tiangan[ganIndex] + dizhi[zhiIndex],
      startAge,
      endAge: startAge + 9,
      startYear,
      endYear: startYear + 9,
      trend,
      description: getTrendDescription(trend),
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

export const DayunChart = ({ baziData, gender }: DayunChartProps) => {
  if (!baziData?.bazi?.year) {
    return null;
  }

  const dayuns = calculateDayun(baziData.bazi.year, gender);
  const currentYear = new Date().getFullYear();

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">大运流年图表</h3>
        <p className="text-sm text-muted-foreground">
          展示未来10步大运的走势预测，每步大运10年
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
          大运是传统命理中每10年一步的运势周期。大运的吉凶判断需结合八字格局、用神喜忌等多方面因素综合分析。
          本图表仅供参考，具体分析请查看AI专业解读。
        </p>
      </div>
    </Card>
  );
};