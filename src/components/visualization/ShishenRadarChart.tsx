import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface ShishenRadarChartProps {
  baziData: any;
  onShishenHover: (shishen: string, info: string) => void;
}

export const ShishenRadarChart = ({ baziData, onShishenHover }: ShishenRadarChartProps) => {
  // 验证数据结构
  if (!baziData || !baziData.year || !baziData.month || !baziData.day || !baziData.hour) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
        <h3 className="text-lg font-semibold mb-4">十神关系雷达图</h3>
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          暂无数据，请先计算八字
        </div>
      </Card>
    );
  }

  // 计算十神强度 - 基于真实天干关系
  const calculateShishen = () => {
    const dayGan = baziData.day?.stem;
    if (!dayGan) return [];

    // 十干阴阳属性
    const ganYinYang: Record<string, 'yang' | 'yin'> = {
      '甲': 'yang', '乙': 'yin', '丙': 'yang', '丁': 'yin', '戊': 'yang',
      '己': 'yin', '庚': 'yang', '辛': 'yin', '壬': 'yang', '癸': 'yin'
    };

    // 十干五行
    const ganWuxing: Record<string, string> = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    };

    // 五行生克关系
    const wuxingRelation: Record<string, { sheng: string; ke: string; beisheng: string; beike: string }> = {
      '木': { sheng: '火', ke: '土', beisheng: '水', beike: '金' },
      '火': { sheng: '土', ke: '金', beisheng: '木', beike: '水' },
      '土': { sheng: '金', ke: '水', beisheng: '火', beike: '木' },
      '金': { sheng: '水', ke: '木', beisheng: '土', beike: '火' },
      '水': { sheng: '木', ke: '火', beisheng: '金', beike: '土' }
    };

    // 计算十神关系
    const getShishen = (gan: string): string => {
      const dayElement = ganWuxing[dayGan];
      const ganElement = ganWuxing[gan];
      const relation = wuxingRelation[dayElement];
      const isSameYinYang = ganYinYang[dayGan] === ganYinYang[gan];

      if (ganElement === dayElement) {
        return isSameYinYang ? '比肩' : '劫财';
      } else if (ganElement === relation.sheng) {
        return isSameYinYang ? '食神' : '伤官';
      } else if (ganElement === relation.beike) {
        return isSameYinYang ? '偏财' : '正财';
      } else if (ganElement === relation.ke) {
        return isSameYinYang ? '偏官' : '正官';
      } else if (ganElement === relation.beisheng) {
        return isSameYinYang ? '偏印' : '正印';
      }
      return '';
    };

    // 统计十神
    const shishenCount: Record<string, number> = {
      '比肩': 0, '劫财': 0, '食神': 0, '伤官': 0,
      '正财': 0, '偏财': 0, '正官': 0, '偏官': 0,
      '正印': 0, '偏印': 0
    };

    // 遍历四柱天干（不含日干）
    [baziData.year?.stem, baziData.month?.stem, baziData.hour?.stem]
      .filter(Boolean)
      .forEach(gan => {
        const shishen = getShishen(gan!);
        if (shishen) shishenCount[shishen]++;
      });

    // 返回数据，将计数转换为强度值（0-10）
    const shishenData = [
      { name: '比肩', value: shishenCount['比肩'], description: '兄弟朋友，竞争对手，独立自主' },
      { name: '劫财', value: shishenCount['劫财'], description: '合作伙伴，破财风险，果敢行动' },
      { name: '食神', value: shishenCount['食神'], description: '才华展现，福禄之星，温和包容' },
      { name: '伤官', value: shishenCount['伤官'], description: '创新能力，表达欲强，才华横溢' },
      { name: '正财', value: shishenCount['正财'], description: '工资收入，稳定之财，勤劳务实' },
      { name: '偏财', value: shishenCount['偏财'], description: '意外之财，副业收入，善于交际' },
      { name: '正官', value: shishenCount['正官'], description: '权力地位，稳定工作，遵纪守法' },
      { name: '偏官', value: shishenCount['偏官'], description: '挑战压力，竞争环境，勇于冒险' },
      { name: '正印', value: shishenCount['正印'], description: '学习能力，贵人相助，稳重踏实' },
      { name: '偏印', value: shishenCount['偏印'], description: '特殊技能，偏门知识，独特思维' }
    ];

    // 将计数转换为0-10的强度值
    const maxCount = Math.max(...Object.values(shishenCount), 1);
    return shishenData.map(item => ({
      ...item,
      value: Math.round((item.value / maxCount) * 10)
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
