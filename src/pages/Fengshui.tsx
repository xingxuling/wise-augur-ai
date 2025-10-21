import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Compass, Home, Loader2, Sparkles } from "lucide-react";
import { MembershipBadge } from "@/components/MembershipBadge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useMembership } from "@/hooks/useMembership";

const HOUSE_DIRECTIONS = [
  { value: "north", label: "正北 (坐北朝南)" },
  { value: "northeast", label: "东北 (坐东北朝西南)" },
  { value: "east", label: "正东 (坐东朝西)" },
  { value: "southeast", label: "东南 (坐东南朝西北)" },
  { value: "south", label: "正南 (坐南朝北)" },
  { value: "southwest", label: "西南 (坐西南朝东北)" },
  { value: "west", label: "正西 (坐西朝东)" },
  { value: "northwest", label: "西北 (坐西北朝东南)" },
];

const HOUSE_TYPES = [
  { value: "apartment", label: "公寓" },
  { value: "house", label: "独栋住宅" },
  { value: "villa", label: "别墅" },
  { value: "office", label: "办公室" },
  { value: "shop", label: "商铺" },
];

const ANALYSIS_TYPES = [
  { value: "general", label: "整体风水" },
  { value: "bedroom", label: "卧室布局" },
  { value: "living", label: "客厅布局" },
  { value: "office", label: "办公室布局" },
  { value: "wealth", label: "财位分析" },
  { value: "health", label: "健康位分析" },
];

export default function Fengshui() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { membership, hasFeature } = useMembership();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  
  const [formData, setFormData] = useState({
    houseType: "",
    direction: "",
    analysisType: "",
    floor: "",
    buildYear: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasFeature('fengshui')) {
      toast({
        title: "功能受限",
        description: "风水测算需要基础版及以上会员",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }

    if (!formData.houseType || !formData.direction || !formData.analysisType) {
      toast({
        title: "请完善信息",
        description: "请填写完整的房屋信息",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysis("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      const { data, error } = await supabase.functions.invoke('fengshui-analysis', {
        body: {
          userId: user.id,
          houseType: formData.houseType,
          direction: formData.direction,
          analysisType: formData.analysisType,
          floor: formData.floor,
          buildYear: formData.buildYear,
          description: formData.description,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || '分析失败');
      }

      setAnalysis(data.analysis);
      
      toast({
        title: "风水分析完成",
        description: "已为您生成专业的风水建议",
      });
    } catch (error) {
      console.error('风水分析错误:', error);
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      houseType: "",
      direction: "",
      analysisType: "",
      floor: "",
      buildYear: "",
      description: "",
    });
    setAnalysis("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12">
      <div className="container px-4 mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <div className="flex items-center gap-3">
              <MembershipBadge />
              <LanguageSelector />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient">风水测算</h1>
              <p className="text-muted-foreground">基于传统风水理论，为您的居所提供专业建议</p>
            </div>
          </div>
        </div>

        {!analysis ? (
          <Card className="p-8 bg-card/80 backdrop-blur-md border-primary/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 房屋类型 */}
              <div className="space-y-2">
                <Label htmlFor="houseType">房屋类型 *</Label>
                <Select
                  value={formData.houseType}
                  onValueChange={(value) => setFormData({ ...formData, houseType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择房屋类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUSE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 房屋朝向 */}
              <div className="space-y-2">
                <Label htmlFor="direction">房屋朝向 *</Label>
                <Select
                  value={formData.direction}
                  onValueChange={(value) => setFormData({ ...formData, direction: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择房屋朝向" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUSE_DIRECTIONS.map((dir) => (
                      <SelectItem key={dir.value} value={dir.value}>
                        {dir.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 分析类型 */}
              <div className="space-y-2">
                <Label htmlFor="analysisType">分析类型 *</Label>
                <Select
                  value={formData.analysisType}
                  onValueChange={(value) => setFormData({ ...formData, analysisType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择分析类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 楼层和建造年份 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">楼层（可选）</Label>
                  <Input
                    id="floor"
                    type="number"
                    placeholder="如: 8"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildYear">建造年份（可选）</Label>
                  <Input
                    id="buildYear"
                    type="number"
                    placeholder="如: 2020"
                    value={formData.buildYear}
                    onChange={(e) => setFormData({ ...formData, buildYear: e.target.value })}
                  />
                </div>
              </div>

              {/* 详细描述 */}
              <div className="space-y-2">
                <Label htmlFor="description">房屋详细描述（可选）</Label>
                <Textarea
                  id="description"
                  placeholder="请描述房屋的格局、周边环境等信息，如：三室两厅、临近公园、西南角有卫生间等"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* 提示信息 */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  💡 提示：提供更详细的房屋信息，将获得更准确的风水分析建议
                </p>
              </div>

              {/* 提交按钮 */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始风水分析
                  </>
                )}
              </Button>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 分析结果 */}
            <Card className="p-8 bg-card/80 backdrop-blur-md border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">风水分析报告</h2>
              </div>

              {/* 免责声明 */}
              <div className="mb-6 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  ⚠️ <strong>重要提示：</strong>本分析基于传统风水理论生成，仅供参考。实际居住舒适度与个人习惯、装修品质等多因素相关，请理性对待。
                </p>
              </div>

              {/* 分析内容 */}
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {analysis}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-8 pt-6 border-t border-border flex gap-3">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  重新分析
                </Button>
                <Button variant="default" onClick={() => navigate('/bazi')} className="flex-1">
                  八字测算
                </Button>
              </div>
            </Card>

            {/* 建议卡片 */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-3">💡 风水改善建议</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 保持室内整洁通风，有利于气场流通</li>
                <li>• 适当摆放绿植，可增添生气与活力</li>
                <li>• 注意光线充足，避免阴暗潮湿环境</li>
                <li>• 定期调整家具布局，优化居住体验</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
