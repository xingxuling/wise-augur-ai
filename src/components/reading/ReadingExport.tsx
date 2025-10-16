import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Image as ImageIcon, FileText } from 'lucide-react';
import { useMembership } from '@/hooks/useMembership';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReadingExportProps {
  baziRecordId: string;
  contentRef: React.RefObject<HTMLElement>;
  baziData: any;
}

export const ReadingExport = ({
  baziRecordId,
  contentRef,
  baziData,
}: ReadingExportProps) => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const { hasFeature, membership } = useMembership();

  const handleExportImage = async () => {
    if (!contentRef.current) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `通胜AI-八字解读-${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: '导出成功',
        description: '解读长图已保存',
      });
    } catch (error) {
      console.error('Failed to export image:', error);
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!hasFeature('exportPdf')) {
      toast({
        title: '功能受限',
        description: '需要进阶版及以上会员才能导出PDF',
        variant: 'destructive',
      });
      return;
    }

    if (!contentRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`通胜AI-八字解读-${new Date().toLocaleDateString()}.pdf`);

      toast({
        title: '导出成功',
        description: 'PDF文档已保存',
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportImage}
        disabled={exporting}
        className="gap-2"
      >
        <ImageIcon className="w-4 h-4" />
        {exporting ? '导出中...' : '导出长图'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={exporting || !hasFeature('exportPdf')}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        {exporting ? '导出中...' : 'PDF导出'}
        {!hasFeature('exportPdf') && (
          <span className="text-xs text-muted-foreground">(进阶版)</span>
        )}
      </Button>
    </div>
  );
};