import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMembership } from '@/hooks/useMembership';

interface LiunianAnalysisProps {
  baziRecordId: string;
  birthYear: number;
  baziData: any;
}

interface YearAnalysis {
  year: number;
  age: number;
  ganZhi: string;
  trend: 'good' | 'neutral' | 'bad';
  summary: string;
  details?: string;
}

export const LiunianAnalysis = ({ baziRecordId, birthYear, baziData }: LiunianAnalysisProps) => {
  const [analyses, setAnalyses] = useState<YearAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const { membership } = useMembership();

  const generateLiunianAnalyses = () => {
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear;
    
    // 生成未来5年的流年分析
    const years: YearAnalysis[] = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      const age = currentAge + i;
      
      // 简化的天干地支计算（实际应用中需要更精确的算法）
      const ganIndex = (year - 4) % 10;
      const zhiIndex = (year - 4) % 12;
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][ganIndex];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][zhiIndex];
      
      // 简化的运势判断（实际应用中需要复杂的五行生克分析）
      const trendValue = (ganIndex + zhiIndex) % 3;
      const trend = trendValue === 0 ? 'good' : trendValue === 1 ? 'neutral' : 'bad';
      
      const summaries = {
        good: '运势顺遂，适合开拓进取',
        neutral: '运势平稳，守成为宜',
        bad: '需谨慎行事，防范风险',
      };
      
      years.push({
        year,
        age,
        ganZhi: `${gan}${zhi}`,
        trend,
        summary: summaries[trend],
      });
    }
    
    setAnalyses(years);
  };

  const loadAIAnalysis = async () => {
    if (!membership || membership.tier === 'free') {
      toast({
        title: '会员专享功能',
        description: '升级会员后可获取AI深度流年解读',
        variant: 'default',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 这里可以调用AI服务获取详细分析
      // 暂时使用模拟数据
      toast({
        title: 'AI分析功能',
        description: '深度AI流年分析功能开发中，敬请期待',
      });
    } catch (error) {
      console.error('Failed to load AI analysis:', error);
      toast({
        title: '加载失败',
        description: '无法获取AI分析结果',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    generateLiunianAnalyses();
    setExpanded(true);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'good':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bad':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'good':
        return 'border-l-green-500 bg-green-500/5';
      case 'bad':
        return 'border-l-red-500 bg-red-500/5';
      default:
        return 'border-l-yellow-500 bg-yellow-500/5';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            流年运势分析
          </CardTitle>
          {analyses.length === 0 && (
            <Button onClick={handleGenerate} size="sm">
              生成流年分析
            </Button>
          )}
        </div>
      </CardHeader>

      {analyses.length > 0 && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div
                key={analysis.year}
                className={`p-4 rounded-lg border-l-4 ${getTrendColor(analysis.trend)} transition-colors`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-foreground">
                        {analysis.year}年
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({analysis.age}岁)
                      </span>
                      <span className="text-base font-medium text-primary">
                        {analysis.ganZhi}年
                      </span>
                      {getTrendIcon(analysis.trend)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={loadAIAnalysis}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              AI深度解读
            </Button>
            <Button
              onClick={() => setExpanded(!expanded)}
              variant="ghost"
              size="sm"
            >
              {expanded ? '收起' : '展开更多'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            流年分析基于传统命理计算，仅供参考
          </p>
        </CardContent>
      )}
    </Card>
  );
};
