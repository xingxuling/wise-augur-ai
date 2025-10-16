import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface ShishenRadarChartProps {
  baziData: any;
  onShishenHover: (shishen: string, info: string) => void;
}

export const ShishenRadarChart = ({ baziData, onShishenHover }: ShishenRadarChartProps) => {
  // 计算十神强度
  const calculateShishen = () => {
    // 简化计算：基于天干关系
    const dayGan = baziData.day.stem;
    const shishenData = [
      { name: '比肩', value: 0, description: '兄弟朋友，竞争对手' },
      { name: '劫财', value: 0, description: '合作伙伴，破财风险' },
      { name: '食神', value: 0, description: '才华展现，福禄之星' },
      { name: '伤官', value: 0, description: '创新能力，表达欲强' },
      { name: '正财', value: 0, description: '工资收入，稳定之财' },
      { name: '偏财', value: 0, description: '意外之财，副业收入' },
      { name: '正官', value: 0, description: '权力地位，稳定工作' },
      { name: '七杀', value: 0, description: '挑战压力，竞争环境' },
      { name: '正印', value: 0, description: '学习能力，贵人相助' },
      { name: '偏印', value: 0, description: '特殊技能，偏门知识' }
    ];

    // 统计十神出现
    const gans = [baziData.year.stem, baziData.month.stem, baziData.hour.stem];
    gans.forEach(gan => {
      if (gan === dayGan) {
        shishenData[0].value += 3; // 比肩
      } else {
        // 简化逻辑：随机分配强度用于演示
        const index = Math.floor(Math.random() * 10);
        shishenData[index].value += Math.floor(Math.random() * 5) + 3;
      }
    });

    return shishenData.map(item => ({
      ...item,
      value: Math.min(item.value, 10) // 限制最大值为10
    }));
  };

  const data = calculateShishen();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div 
          className="bg-background/95 backdrop-blur-md p-3 border border-primary/20 rounded-lg shadow-lg max-w-xs"
          onMouseEnter={() => onShishenHover(item.name, item.description)}
        >
          <p className="font-semibold text-primary">{item.name}</p>
          <p className="text-sm">强度：{item.value}/10</p>
          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
      <h3 className="text-lg font-semibold mb-4">十神关系雷达图</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Radar
            name="十神强度"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};
