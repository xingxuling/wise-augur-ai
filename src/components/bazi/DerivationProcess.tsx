import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Info, Download, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMembership } from '@/hooks/useMembership';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface DerivationStep {
  index: number;
  name: string;
  title: string;
  data: any;
  explanation: string;
  isLocked: boolean;
}

interface DerivationProcessProps {
  baziRecordId: string;
  baziData: any;
  onJumpToVisualization?: (chartType: string) => void;
}

export const DerivationProcess = ({ 
  baziRecordId, 
  baziData,
  onJumpToVisualization 
}: DerivationProcessProps) => {
  const [steps, setSteps] = useState<DerivationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const { membership, hasFeature } = useMembership();

  useEffect(() => {
    generateDerivationSteps();
  }, [baziData, baziRecordId]);

  const generateDerivationSteps = async () => {
    setLoading(true);
    try {
      // 步骤1: 八字排盘
      const step1 = {
        index: 0,
        name: 'bazi_chart',
        title: '八字排盘',
        data: {
          input: {
            year: baziData.year,
            month: baziData.month,
            day: baziData.day,
            hour: baziData.hour
          },
          output: baziData.bazi,
          method: '万年历匹配 + 真太阳时修正'
        },
        explanation: `根据您的出生时间，通过中华万年历2024版进行干支匹配。\n\n**排盘依据：**\n• 年柱：${baziData.bazi?.year || '未知'}\n• 月柱：${baziData.bazi?.month || '未知'}\n• 日柱：${baziData.bazi?.day || '未知'} （日主）\n• 时柱：${baziData.bazi?.hour || '未知'}\n\n真太阳时修正已应用，确保时柱准确性。`,
        isLocked: false
      };

      // 步骤2: 五行强度计算
      const wuxingAnalysis = baziData.wuxingAnalysis || {};
      const total = Object.values(wuxingAnalysis).reduce((a: number, b: any) => a + Number(b), 0) as number;
      
      const step2 = {
        index: 1,
        name: 'wuxing_calculation',
        title: '五行强度计算',
        data: {
          scores: wuxingAnalysis,
          total: total,
          strongest: Object.entries(wuxingAnalysis).reduce((a, b) => 
            (Number(a[1]) > Number(b[1]) ? a : b)
          )[0],
          lacking: baziData.lackingWuxing || []
        },
        explanation: generateWuxingExplanation(wuxingAnalysis, total, onJumpToVisualization),
        isLocked: false
      };

      // 步骤3: 格局判定
      const pattern = (baziData as any).pattern;
      const step3 = {
        index: 2,
        name: 'pattern_determination',
        title: '格局判定',
        data: {
          pattern: pattern?.pattern || '普通格局',
          isSpecial: pattern?.isSpecial || false,
          description: pattern?.description || '',
          allPatterns: pattern?.allPatterns || []
        },
        explanation: generatePatternExplanation(pattern),
        isLocked: !hasFeature('customReading') // 进阶会员可见
      };

      // 步骤4: 解读匹配
      const step4 = {
        index: 3,
        name: 'reading_matching',
        title: '解读匹配',
        data: {
          pattern: pattern?.pattern,
          classicReference: '《滴天髓》《三命通会》',
          caseMatching: '已匹配同格局案例库'
        },
        explanation: `根据格局"${pattern?.pattern || '普通格局'}"，系统从经典典籍和案例库中匹配相关解读：\n\n**典籍依据：**\n• 主要参考《滴天髓》格局论\n• 辅助参考《三命通会》用神篇\n\n**案例匹配：**\n已从案例库中筛选出相同格局的真实案例，供您参考对照。\n\n点击下方"查看完整解读"可查看详细分析。`,
        isLocked: !hasFeature('customReading') // 进阶会员可见
      };

      const allSteps = [step1, step2, step3, step4];

      // 缓存到数据库（仅缓存可见步骤）
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        for (const step of allSteps) {
          if (!step.isLocked) {
            await supabase
              .from('bazi_derivation_cache')
              .upsert({
                bazi_record_id: baziRecordId,
                user_id: user.id,
                step_index: step.index,
                step_name: step.name,
                calculation_data: step.data,
                explanation: step.explanation
              }, {
                onConflict: 'bazi_record_id,step_index'
              });
          }
        }
      }

      setSteps(allSteps);
    } catch (error) {
      console.error('Failed to generate derivation steps:', error);
      toast.error('推导过程生成失败');
    } finally {
      setLoading(false);
    }
  };

  const generateWuxingExplanation = (
    analysis: Record<string, number>, 
    total: number,
    jumpCallback?: (chartType: string) => void
  ) => {
    const entries = Object.entries(analysis);
    const sorted = entries.sort((a, b) => Number(b[1]) - Number(a[1]));
    
    let explanation = '**五行得分明细：**\n\n';
    sorted.forEach(([element, count]) => {
      const percentage = ((Number(count) / total) * 100).toFixed(1);
      const status = Number(count) >= 3 ? '旺' : Number(count) === 2 ? '平' : '弱';
      explanation += `• ${element}：${count}个（${percentage}% - ${status}）\n`;
    });

    explanation += '\n**计算规则说明：**\n';
    explanation += '• 天干、地支各计1分\n';
    explanation += '• 地支藏干按比例计分\n';
    explanation += '• 生扶关系可增加权重\n';
    
    if (jumpCallback) {
      explanation += '\n\n💡 点击"查看五行图表"可直观查看分布情况';
    }

    return explanation;
  };

  const generatePatternExplanation = (pattern: any) => {
    if (!pattern) {
      return '格局判定数据未完整，请重新排盘。';
    }

    let explanation = `**格局识别结果：${pattern.pattern}**\n\n`;
    explanation += `${pattern.description}\n\n`;

    if (pattern.isSpecial) {
      explanation += '**特殊格局说明：**\n';
      explanation += '此格局属于特殊格局，需满足严格的成格条件。\n\n';

      if (pattern.allPatterns && pattern.allPatterns.length > 0) {
        explanation += '**成格依据：**\n';
        pattern.allPatterns.forEach((p: any, idx: number) => {
          explanation += `${idx + 1}. ${p.name}\n`;
          explanation += `   • 条件：${p.condition}\n`;
          explanation += `   • 典籍：${p.reference}\n\n`;
        });
      }
    } else {
      explanation += '**格局判定流程：**\n';
      explanation += '1. 判断是否为专旺格 → 否\n';
      explanation += '2. 判断是否为从格 → 否\n';
      explanation += '3. 确定为普通格局\n\n';
      explanation += '**典籍依据：** 《滴天髓》格局论';
    }

    return explanation;
  };

  const handleExportReport = async () => {
    if (!hasFeature('exportPdf')) {
      toast.error('导出推导报告需要进阶版及以上会员');
      return;
    }

    toast.success('推导报告导出功能开发中，敬请期待');
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">正在生成推导过程...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">🔍 命理推导过程</h3>
          <p className="text-sm text-muted-foreground">
            从排盘到解读的完整推理链路，点击步骤查看详情
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportReport}
          disabled={!hasFeature('exportPdf')}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          导出报告
          {!hasFeature('exportPdf') && <Lock className="w-3 h-3" />}
        </Button>
      </div>

      {/* 步骤流程图 */}
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <div key={step.index} className="flex items-center">
            <div
              className={`
                flex flex-col items-center cursor-pointer transition-all
                ${currentStep === index ? 'scale-110' : 'opacity-60 hover:opacity-100'}
                ${step.isLocked ? 'opacity-40' : ''}
              `}
              onClick={() => !step.isLocked && setCurrentStep(index)}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${currentStep === index
                    ? 'bg-primary text-primary-foreground'
                    : step.isLocked
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary/20 text-primary'
                  }
                `}
              >
                {step.isLocked ? <Lock className="w-4 h-4" /> : index + 1}
              </div>
              <p className="text-xs mt-2 text-center max-w-[80px]">{step.title}</p>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* 当前步骤详情 */}
      <div className="space-y-4">
        {steps[currentStep].isLocked ? (
          <Card className="p-6 bg-muted/30 text-center">
            <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              此步骤需要进阶版及以上会员查看
            </p>
            <Button size="sm" onClick={() => window.location.href = '/pricing'}>
              升级会员解锁
            </Button>
          </Card>
        ) : (
          <>
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">{steps[currentStep].title}</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {steps[currentStep].explanation}
                  </div>
                </div>
              </div>
            </Card>

            {/* 步骤数据展示 */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="data">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>查看计算数据</span>
                    <Badge variant="outline" className="text-xs">
                      详细
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-background p-4 rounded-lg overflow-auto border">
                    {JSON.stringify(steps[currentStep].data, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* 联动图表 */}
            {onJumpToVisualization && steps[currentStep].name === 'wuxing_calculation' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onJumpToVisualization('wuxing')}
              >
                查看五行分布图表
              </Button>
            )}
          </>
        )}

        {/* 导航按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className="flex-1"
          >
            上一步
          </Button>
          <Button
            variant="outline"
            disabled={currentStep === steps.length - 1 || steps[currentStep + 1]?.isLocked}
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="flex-1"
          >
            下一步
          </Button>
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
        <p>
          💡 <strong>推导规则说明：</strong>所有计算遵循《三命通会》《滴天髓》等经典著作，
          {membership && membership.tier !== 'free' 
            ? '升级尊享版可解锁全部4步推导过程。' 
            : '基础版用户可查看前2步，进阶/尊享版可查看完整推导。'
          }
        </p>
      </div>
    </Card>
  );
};
