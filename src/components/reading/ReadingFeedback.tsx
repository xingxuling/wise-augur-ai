import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare } from 'lucide-react';

interface ReadingFeedbackProps {
  baziRecordId: string;
  readingType: string;
  readingContent: string;
}

const FEEDBACK_TYPES = [
  { value: '术语难懂', label: '术语理解难' },
  { value: '建议不落地', label: '建议不够落地' },
  { value: '与实际不符', label: '与实际情况不符' },
  { value: '其他', label: '其他问题' },
];

export const ReadingFeedback = ({
  baziRecordId,
  readingType,
  readingContent,
}: ReadingFeedbackProps) => {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedbackType) {
      toast({
        title: '请选择反馈类型',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('reading_feedbacks')
        .insert({
          user_id: user.id,
          bazi_record_id: baziRecordId,
          reading_type: readingType,
          reading_content: readingContent,
          feedback_type: feedbackType,
          feedback_text: feedbackText,
        });

      if (error) throw error;

      toast({
        title: '反馈已提交',
        description: '感谢您的反馈,我们会尽快优化解读内容',
      });

      setOpen(false);
      setFeedbackType('');
      setFeedbackText('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: '提交失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          觉得不准?反馈
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>解读反馈</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">请选择问题类型</label>
            <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
              {FEEDBACK_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <label className="text-sm font-medium">详细描述（可选）</label>
            <Textarea
              placeholder="请描述具体问题,帮助我们改进..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !feedbackType}>
              {submitting ? '提交中...' : '提交反馈'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};