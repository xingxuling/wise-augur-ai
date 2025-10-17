import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMembership } from '@/hooks/useMembership';
import { useAIUsage } from '@/hooks/useAIUsage';

interface CustomQuestionProps {
  baziRecordId: string;
  baziData: any;
}

export const CustomQuestion = ({ baziRecordId, baziData }: CustomQuestionProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { membership, canUseAI } = useMembership();
  const { usageCount, recordUsage } = useAIUsage();

  const handleSubmit = async () => {
    // 输入验证：问题不能为空
    if (!question.trim()) {
      toast({
        title: '请输入问题',
        description: '请输入您想要咨询的命理问题',
        variant: 'destructive',
      });
      return;
    }

    // 输入验证：问题长度限制
    if (question.trim().length < 10) {
      toast({
        title: '问题太短',
        description: '请输入至少10个字符的问题',
        variant: 'destructive',
      });
      return;
    }

    if (question.trim().length > 500) {
      toast({
        title: '问题太长',
        description: '问题长度不能超过500个字符',
        variant: 'destructive',
      });
      return;
    }

    // 检查会员权限
    if (!membership || membership.tier === 'free') {
      toast({
        title: '会员专享功能',
        description: '自定义问题解答功能需要升级会员',
        variant: 'default',
      });
      return;
    }

    // 检查AI使用次数
    if (!canUseAI(usageCount)) {
      toast({
        title: '使用次数已达上限',
        description: '您本月的AI解读次数已用完',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setAnswer('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      // 保存问题到数据库
      const { data: questionData, error: insertError } = await supabase
        .from('custom_questions')
        .insert({
          user_id: user.id,
          bazi_record_id: baziRecordId,
          question: question.trim(),
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: '问题已提交',
        description: 'AI正在分析您的八字并生成解答...',
      });

      // 调用AI解答
      const { data: aiData, error: aiError } = await supabase.functions.invoke('custom-question-answer', {
        body: {
          questionId: questionData.id,
        },
      });

      if (aiError) throw aiError;

      if (!aiData.success) {
        throw new Error(aiData.error || 'AI解答失败');
      }

      setAnswer(aiData.answer);
      setQuestion(''); // 清空输入框
      
      // 记录AI使用
      await recordUsage(baziRecordId);

      toast({
        title: '解答完成',
        description: 'AI已根据您的八字给出专业建议',
      });
    } catch (error) {
      console.error('Custom question error:', error);
      toast({
        title: '解答失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-card/80 backdrop-blur-md border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          自定义问题咨询
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          根据您的八字，提出任何命理相关的问题，AI将为您解答
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="例如：我适合从事什么行业？今年感情运势如何？何时适合创业？
注意：问题长度需在10-500字符之间"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={loading}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {membership?.tier === 'free' ? '升级会员后可使用' : '会员专享功能'}
              </span>
              <span className="text-xs text-muted-foreground">
                {question.length}/500 字符
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !question.trim() || question.trim().length < 10}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI解答中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  提交问题
                </>
              )}
            </Button>
          </div>
        </div>

        {answer && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="font-semibold mb-2 text-primary">AI解答：</h4>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {answer}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t">
              以上建议仅供参考，人生走向取决于自身选择与努力
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
