import { Card } from '@/components/ui/card';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BaziMatrixChartProps {
  baziData: any;
}

export const BaziMatrixChart = ({ baziData }: BaziMatrixChartProps) => {
  const [selectedPillar, setSelectedPillar] = useState<any>(null);

  const wuxingMap: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
    '庚': '金', '辛': '金', '壬': '水', '癸': '水',
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };

  const wuxingColors: Record<string, string> = {
    '金': 'bg-gray-300 border-gray-400',
    '木': 'bg-green-200 border-green-400',
    '水': 'bg-blue-200 border-blue-400',
    '火': 'bg-red-200 border-red-400',
    '土': 'bg-yellow-200 border-yellow-400'
  };

  const pillars = [
    { label: '年柱', data: baziData.year, meaning: '祖辈运势、童年环境' },
    { label: '月柱', data: baziData.month, meaning: '父母兄弟、青年时期' },
    { label: '日柱', data: baziData.day, meaning: '自身配偶、中年运势' },
    { label: '时柱', data: baziData.hour, meaning: '子女晚年、事业成就' }
  ];

  const handlePillarClick = (pillar: any) => {
    const stemElement = wuxingMap[pillar.data.stem];
    const branchElement = wuxingMap[pillar.data.branch];
    
    setSelectedPillar({
      ...pillar,
      stemElement,
      branchElement,
      relationship: getRelationship(stemElement, branchElement)
    });
  };

  const getRelationship = (stem: string, branch: string) => {
    const shengMap: Record<string, string> = {
      '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
    };
    const keMap: Record<string, string> = {
      '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
    };

    if (shengMap[stem] === branch) return '天干生地支，气势流通';
    if (keMap[stem] === branch) return '天干克地支，需注意消耗';
    if (shengMap[branch] === stem) return '地支生天干，得根有力';
    if (keMap[branch] === stem) return '地支克天干，力量受制';
    return '天干地支中和，平稳发展';
  };

  const isSpecialPattern = baziData.pattern?.pattern && 
    !baziData.pattern.pattern.includes('普通');

  return (
    <>
      <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
        <h3 className="text-lg font-semibold mb-4">八字干支矩阵图</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border p-2 bg-muted/50 text-sm">位置</th>
                {pillars.map((pillar, idx) => (
                  <th key={idx} className="border border-border p-2 bg-muted/50 text-sm">
                    {pillar.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2 bg-muted/30 font-medium text-sm">
                  天干
                </td>
                {pillars.map((pillar, idx) => {
                  const element = wuxingMap[pillar.data.stem];
                  const colorClass = wuxingColors[element];
                  return (
                    <td 
                      key={idx} 
                      className={`border border-border p-4 ${colorClass} cursor-pointer hover:opacity-80 transition-all`}
                      onClick={() => handlePillarClick(pillar)}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">{pillar.data.stem}</div>
                        <div className="text-xs text-muted-foreground mt-1">{element}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="border border-border p-2 bg-muted/30 font-medium text-sm">
                  地支
                </td>
                {pillars.map((pillar, idx) => {
                  const element = wuxingMap[pillar.data.branch];
                  const colorClass = wuxingColors[element];
                  const isSpecial = isSpecialPattern && idx === 2; // 日柱特殊标记
                  return (
                    <td 
                      key={idx} 
                      className={`border ${isSpecial ? 'border-primary border-2' : 'border-border'} p-4 ${colorClass} cursor-pointer hover:opacity-80 transition-all`}
                      onClick={() => handlePillarClick(pillar)}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">{pillar.data.branch}</div>
                        <div className="text-xs text-muted-foreground mt-1">{element}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {isSpecialPattern && (
          <p className="text-xs text-primary mt-3 text-center">
            * 特殊格局：{baziData.pattern.pattern}（彩色边框标记）
          </p>
        )}
      </Card>

      <Dialog open={!!selectedPillar} onOpenChange={() => setSelectedPillar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPillar?.label}详解</DialogTitle>
            <DialogDescription>
              {selectedPillar?.meaning}
            </DialogDescription>
          </DialogHeader>
          {selectedPillar && (
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">天干：{selectedPillar.data.stem}</p>
                <p className="text-xs text-muted-foreground">
                  五行属{selectedPillar.stemElement}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">地支：{selectedPillar.data.branch}</p>
                <p className="text-xs text-muted-foreground">
                  五行属{selectedPillar.branchElement}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">生克关系</p>
                <p className="text-xs mt-1">{selectedPillar.relationship}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
