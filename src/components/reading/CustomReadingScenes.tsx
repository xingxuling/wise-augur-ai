import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Heart, DollarSign, Heart as Health, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMembership } from '@/hooks/useMembership';

interface Scene {
  type: string;
  label: string;
  icon: any;
  categories: { value: string; label: string }[];
}

const scenes: Scene[] = [
  {
    type: 'career',
    label: '职场发展',
    icon: Briefcase,
    categories: [
      { value: 'exam', label: '考公考编' },
      { value: 'job_change', label: '跳槽转行' },
      { value: 'promotion', label: '晋升加薪' }
    ]
  },
  {
    type: 'love',
    label: '感情婚姻',
    icon: Heart,
    categories: [
      { value: 'single', label: '脱单桃花' },
      { value: 'reconcile', label: '挽回复合' },
      { value: 'pregnancy', label: '备孕生育' }
    ]
  },
  {
    type: 'wealth',
    label: '财运财富',
    icon: DollarSign,
    categories: [
      { value: 'side_business', label: '副业开拓' },
      { value: 'investment', label: '投资理财' },
      { value: 'saving', label: '储蓄规划' }
    ]
  },
  {
    type: 'health',
    label: '健康养生',
    icon: Health,
    categories: [
      { value: 'sleep', label: '睡眠调理' },
      { value: 'digestion', label: '肠胃养护' },
      { value: 'cervical', label: '颈椎保养' }
    ]
  },
  {
    type: 'education',
    label: '学业深造',
    icon: GraduationCap,
    categories: [
      { value: 'postgrad', label: '考研升学' },
      { value: 'civil_exam', label: '考编上岸' },
      { value: 'study_abroad', label: '留学规划' }
    ]
  }
];

interface CustomReadingScenesProps {
  baziRecordId: string;
  onQuestionSubmitted: () => void;
}

export const CustomReadingScenes = ({ baziRecordId, onQuestionSubmitted }: CustomReadingScenesProps) => {
  const [open, setOpen] = useState(false);
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [additionalQuestion, setAdditionalQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { membership } = useMembership();

  const canCustomize = () => {
    if (!membership) return false;
    // 基础版：1次职场/感情场景
    // 进阶版：3次全场景
    // 尊享版：无限次
    return membership.tier !== 'free';
  };

  const handleSubmit = async () => {
    if (!selectedScene || !selectedCategory) {
      toast.error('请选择场景和分类');
      return;
    }

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('请先登录');
        return;
      }

      const scene = scenes.find(s => s.type === selectedScene);
      const category = scene?.categories.find(c => c.value === selectedCategory);
      
      const questionText = `【${scene?.label} - ${category?.label}】${additionalQuestion ? '\n' + additionalQuestion : ''}`;

      const { error } = await supabase
        .from('custom_questions')
        .insert({
          user_id: user.id,
          bazi_record_id: baziRecordId,
          question: questionText,
          scene_type: selectedScene,
          scene_category: selectedCategory,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('定制解读已提交，正在生成...');
      setOpen(false);
      setSelectedScene('');
      setSelectedCategory('');
      setAdditionalQuestion('');
      onQuestionSubmitted();
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <GraduationCap className="w-4 h-4" />
          定制场景解读
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>定制场景解读</DialogTitle>
          <DialogDescription>
            选择您关心的场景，获取针对性的专业解读建议
          </DialogDescription>
        </DialogHeader>

        {!canCustomize() ? (
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">
              定制解读功能需要进阶版及以上会员
            </p>
            <Button size="sm" onClick={() => toast.info('请前往会员中心升级')}>
              升级会员
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>选择场景</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {scenes.map((scene) => (
                  <Card
                    key={scene.type}
                    className={`p-4 cursor-pointer transition-all hover:border-primary ${
                      selectedScene === scene.type ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      setSelectedScene(scene.type);
                      setSelectedCategory('');
                    }}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <scene.icon className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium">{scene.label}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {selectedScene && (
              <div>
                <Label>选择具体分类</Label>
                <RadioGroup 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                  className="mt-2 space-y-2"
                >
                  {scenes.find(s => s.type === selectedScene)?.categories.map((cat) => (
                    <div key={cat.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={cat.value} id={cat.value} />
                      <Label htmlFor={cat.value} className="cursor-pointer">
                        {cat.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {selectedCategory && (
              <div>
                <Label>补充说明（选填）</Label>
                <Textarea
                  placeholder="例如：我计划在2025年3月跳槽，目标是互联网大厂..."
                  value={additionalQuestion}
                  onChange={(e) => setAdditionalQuestion(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              disabled={!selectedCategory || submitting}
              className="w-full"
            >
              {submitting ? '生成中...' : '提交定制解读'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
