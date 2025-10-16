import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface WuxingData {
  name: string;
  value: number;
  status: string;
  color: string;
}

interface WuxingPieChartProps {
  baziData: any;
  onElementClick: (element: string) => void;
}

export const WuxingPieChart = ({ baziData, onElementClick }: WuxingPieChartProps) => {
  // 验证数据结构
  if (!baziData || !baziData.year || !baziData.month || !baziData.day || !baziData.hour) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
        <h3 className="text-lg font-semibold mb-4">五行分布环形图</h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          暂无数据，请先计算八字
        </div>
      </Card>
    );
  }

  // 计算五行分布
  const calculateWuxing = () => {
    const wuxingCount = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    const wuxingMap: Record<string, string> = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
      '庚': '金', '辛': '金', '壬': '水', '癸': '水',
      '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };

    // 统计八字中的五行
    const { year, month, day, hour } = baziData;
    
    // 验证各柱数据完整性
    if (!year?.stem || !year?.branch || !month?.stem || !month?.branch ||
        !day?.stem || !day?.branch || !hour?.stem || !hour?.branch) {
      return [];
    }
    [year.stem, year.branch, month.stem, month.branch, 
     day.stem, day.branch, hour.stem, hour.branch].forEach(char => {
      const element = wuxingMap[char];
      if (element) wuxingCount[element as keyof typeof wuxingCount]++;
    });

    // 计算占比和状态
    const total = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
    const colors: Record<string, string> = {
      '金': '#C0C0C0',
      '木': '#2E8B57',
      '水': '#1E90FF',
      '火': '#DC143C',
      '土': '#D2691E'
    };

    return Object.entries(wuxingCount).map(([name, count]) => {
      const percentage = (count / total) * 100;
      let status = '休';
      if (percentage >= 40) status = '旺';
      else if (percentage >= 25) status = '相';
      else if (percentage <= 10) status = '囚';
      else if (percentage === 0) status = '死';

      return {
        name,
        value: count,
        status,
        color: colors[name],
        percentage: percentage.toFixed(1)
      };
    }).filter(item => item.value > 0);
  };

  const data = calculateWuxing();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-md p-3 border border-primary/20 rounded-lg shadow-lg">
          <p className="font-semibold text-primary">{item.name}行</p>
          <p className="text-sm">占比：{item.percentage}%</p>
          <p className="text-sm">状态：{item.status}</p>
          <p className="text-xs text-muted-foreground mt-1">点击查看详情</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
      <h3 className="text-lg font-semibold mb-4">五行分布环形图</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            onClick={(data) => onElementClick(data.name)}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value, entry: any) => `${entry.payload.name} (${entry.payload.status})`}
            wrapperStyle={{ fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
