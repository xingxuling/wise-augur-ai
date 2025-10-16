import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { History, Loader2, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Question {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  created_at: string;
  answered_at: string | null;
}

export const QuestionHistory = () => {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('custom_questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      toast({
        title: '加载失败',
        description: '无法获取问题历史',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchQuestions();
    }
  }, [open]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个问题吗？')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '删除成功',
        description: '问题已从历史中移除',
      });

      fetchQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      pending: { text: '待处理', color: 'bg-yellow-500/10 text-yellow-500' },
      processing: { text: '处理中', color: 'bg-blue-500/10 text-blue-500' },
      answered: { text: '已解答', color: 'bg-green-500/10 text-green-500' },
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <History className="w-4 h-4" />
            问题历史
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>自定义问题历史</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">暂无问题记录</p>
              <p className="text-sm text-muted-foreground">
                提交自定义问题后，记录会自动保存在这里
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
              {questions.map((q) => (
                <Card
                  key={q.id}
                  className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedQuestion(q)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(q.status)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(q.created_at), 'PPP HH:mm', { locale: zhCN })}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium mb-2">{q.question}</p>
                      
                      {q.answer && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {q.answer}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuestion(q);
                        }}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        查看
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(q.id, e)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            最多显示最近50条记录
          </div>
        </DialogContent>
      </Dialog>

      {/* 问题详情弹窗 */}
      {selectedQuestion && (
        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>问题详情</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">问题</h4>
                <p className="text-sm">{selectedQuestion.question}</p>
              </div>
              
              {selectedQuestion.answer && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">解答</h4>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedQuestion.answer}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                <span>提问时间：{format(new Date(selectedQuestion.created_at), 'PPP HH:mm', { locale: zhCN })}</span>
                {selectedQuestion.answered_at && (
                  <span>解答时间：{format(new Date(selectedQuestion.answered_at), 'PPP HH:mm', { locale: zhCN })}</span>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
