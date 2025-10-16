import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { useMembership } from '@/hooks/useMembership';

interface VisualizationExportProps {
  chartRefs: React.RefObject<HTMLDivElement>[];
  baziData: any;
}

export const VisualizationExport = ({ chartRefs, baziData }: VisualizationExportProps) => {
  const { toast } = useToast();
  const { membership, hasFeature } = useMembership();

  const handleExport = async () => {
    if (!hasFeature('exportImage')) {
      toast({
        title: '升级会员',
        description: '可视化导出功能需要基础会员及以上等级',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: '正在生成图表',
        description: '请稍候...',
      });

      const images: string[] = [];
      
      for (const ref of chartRefs) {
        if (ref.current) {
          const canvas = await html2canvas(ref.current, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
          });
          images.push(canvas.toDataURL('image/png'));
        }
      }

      if (images.length === 0) {
        throw new Error('没有可导出的图表');
      }

      // 创建一个下载链接
      const link = document.createElement('a');
      link.download = `八字可视化_${new Date().toLocaleDateString()}.png`;
      link.href = images[0]; // 导出第一张图表
      link.click();

      toast({
        title: '导出成功',
        description: '图表已保存到您的设备',
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!hasFeature('exportImage')}
    >
      <Download className="w-4 h-4 mr-2" />
      导出图表
      {!hasFeature('exportImage') && (
        <span className="ml-2 text-xs text-muted-foreground">(需要会员)</span>
      )}
    </Button>
  );
};
