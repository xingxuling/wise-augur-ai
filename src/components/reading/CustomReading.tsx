import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMembership } from '@/hooks/useMembership';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomReadingProps {
  baziRecordId: string;
  onReadingComplete: (reading: string) => void;
}

const FOCUS_AREAS = [
  {
    value: 'career_promotion',
    label: '职场晋升',
    description: '分析晋升机会与时机,提供3个具体行动步骤',
  },
  {
    value: 'side_business',
    label: '副业开拓',
    description: '评估副业方向与潜力,给出具体建议',
  },
  {
    value: 'relationship_repair',
    label: '感情复合',
    description: '分析关系修复可能性与最佳时机',
  },
  {
    value: 'health_care',
    label: '健康调理',
    description: '针对五行特点给出养生方案',
  },
  {
    value: 'exam_study',
    label: '学业考试',
    description: '分析学习运势与考试时机选择',
  },
];

export const CustomReading = ({
  baziRecordId,
  onReadingComplete,
}: CustomReadingProps) => {
  const [open, setOpen] = useState(false);
  const [focusArea, setFocusArea] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { hasFeature, membership } = useMembership();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!hasFeature('customReading')) {
      toast({
        title: '功能受限',
        description: '需要进阶版及以上会员才能使用定制化解读',
        variant: 'destructive',
      });
      return;
    }

    if (!focusArea) {
      toast({
        title: '请选择解读侧重点',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-reading', {
        body: {
          baziRecordId,
          readingType: 'custom',
          focusArea,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || '生成失败');
      }

      onReadingComplete(data.reading);
      setOpen(false);
      toast({
        title: '定制解读生成成功',
        description: '已根据您的需求生成专属解读',
      });
    } catch (error) {
      console.error('Failed to generate custom reading:', error);
      toast({
        title: '生成失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/80">
          <Sparkles className="w-4 h-4" />
          定制化解读
          {!hasFeature('customReading') && <Lock className="w-4 h-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>定制化解读 - 选择您的关注重点</DialogTitle>
        </DialogHeader>

        {!hasFeature('customReading') && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-primary mb-1">会员专属功能</p>
                <p className="text-sm text-muted-foreground mb-3">
                  定制化解读需要进阶版及以上会员。升级后可享受针对性的深度分析与具体行动建议。
                </p>
                <Button onClick={handleUpgrade} size="sm">
                  立即升级会员
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <RadioGroup value={focusArea} onValueChange={setFocusArea}>
            {FOCUS_AREAS.map((area) => (
              <div
                key={area.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  focusArea === area.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFocusArea(area.value)}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={area.value} id={area.value} />
                  <div className="flex-1">
                    <Label htmlFor={area.value} className="text-base font-medium cursor-pointer">
                      {area.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {area.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading || !focusArea || !hasFeature('customReading')}
            >
              {loading ? '生成中...' : '生成定制解读'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};