import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { History, Loader2, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface BaziRecord {
  id: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  gender: string;
  result: any;
  created_at: string;
}

interface ReadingHistoryProps {
  onSelectRecord?: (record: BaziRecord) => void;
}

export const ReadingHistory = ({ onSelectRecord }: ReadingHistoryProps) => {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<BaziRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bazi_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      toast({
        title: '加载失败',
        description: '无法获取历史记录',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRecords();
    }
  }, [open]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('确定要删除这条记录吗？删除后无法恢复。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bazi_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '删除成功',
        description: '记录已从历史中移除',
      });

      fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleView = (record: BaziRecord) => {
    onSelectRecord?.(record);
    setOpen(false);
    toast({
      title: '已加载历史记录',
      description: '您可以查看之前的八字分析',
    });
  };

  const formatBaziInfo = (record: BaziRecord) => {
    return `${record.birth_year}年${record.birth_month}月${record.birth_day}日 ${record.birth_hour}时`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <History className="w-4 h-4" />
          历史记录
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>八字解读历史</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">暂无历史记录</p>
            <p className="text-sm text-muted-foreground">
              进行八字测算后，记录会自动保存在这里
            </p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
            {records.map((record) => (
              <Card
                key={record.id}
                className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleView(record)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {formatBaziInfo(record)}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        record.gender === 'male' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-pink-500/10 text-pink-500'
                      }`}>
                        {record.gender === 'male' ? '男' : '女'}
                      </span>
                    </div>
                    
                    {record.result?.bazi && (
                      <div className="flex gap-4 text-sm mb-2">
                        <span className="text-muted-foreground">八字：</span>
                        <div className="flex gap-2">
                          {Object.values(record.result.bazi).map((pillar, idx) => (
                            <span key={idx} className="font-medium text-primary">
                              {pillar as string}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {record.result?.pattern && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">格局：</span>
                        <span className={`ml-2 ${
                          record.result.pattern.isSpecial 
                            ? 'text-primary font-medium' 
                            : 'text-foreground'
                        }`}>
                          {record.result.pattern.pattern}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(record.created_at), 'PPP HH:mm', { locale: zhCN })}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(record);
                      }}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      查看
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(record.id, e)}
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
          最多显示最近20条记录
        </div>
      </DialogContent>
    </Dialog>
  );
};