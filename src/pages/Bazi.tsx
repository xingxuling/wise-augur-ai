import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { z } from "zod";

const baziInputSchema = z.object({
  year: z.number().min(1900).max(2100),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
});

type BaziResult = {
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  wuxingAnalysis: Record<string, number>;
  lackingWuxing: string[];
};

const Bazi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("0");
  const [city, setCity] = useState("北京");
  const [result, setResult] = useState<BaziResult | null>(null);
  const [recordId, setRecordId] = useState<string>("");
  const [aiReading, setAiReading] = useState<string>("");
  const [isLoadingReading, setIsLoadingReading] = useState(false);
  const [showProfessional, setShowProfessional] = useState(false);
  const [activeReadingTab, setActiveReadingTab] = useState<string>("basic");

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "请先登录",
          description: "需要登录才能使用八字测算功能",
          variant: "destructive",
        });
        navigate("/auth");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, toast]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证输入
    try {
      baziInputSchema.parse({
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "输入错误",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setIsCalculating(true);

    try {
      const { data, error } = await supabase.functions.invoke('bazi-calculate', {
        body: {
          birthYear: parseInt(year),
          birthMonth: parseInt(month),
          birthDay: parseInt(day),
          birthHour: parseInt(hour),
          birthMinute: parseInt(minute),
          city: city,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || '计算失败');
      }

      setResult(data.data);
      setRecordId(data.recordId);
      
      toast({
        title: "智能八字解析",
        description: "八字排盘完成",
      });
    } catch (error) {
      console.error('八字计算错误:', error);
      toast({
        title: "计算失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAiReading = async (type: string) => {
    if (!recordId) return;

    setIsLoadingReading(true);
    setAiReading("");

    try {
      const { data, error } = await supabase.functions.invoke('ai-reading', {
        body: {
          baziRecordId: recordId,
          readingType: type,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'AI解读失败');
      }

      setAiReading(data.reading);
    } catch (error) {
      console.error('AI解读错误:', error);
      toast({
        title: "解读失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoadingReading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12">
      <div className="container px-4 mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <h1 className="text-4xl font-bold text-gradient mb-2">智能八字解析</h1>
          <p className="text-muted-foreground">输入您的出生信息，获取精准命理分析</p>
        </div>

        {/* Input Form */}
        {!result && (
          <Card className="p-8 bg-card/80 backdrop-blur-md border-primary/20">
            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">出生年份</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="1990"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    min="1900"
                    max="2100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">月份</Label>
                  <Input
                    id="month"
                    type="number"
                    placeholder="1"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                    min="1"
                    max="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day">日期</Label>
                  <Input
                    id="day"
                    type="number"
                    placeholder="1"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    required
                    min="1"
                    max="31"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hour">时辰(0-23)</Label>
                  <Input
                    id="hour"
                    type="number"
                    placeholder="12"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    required
                    min="0"
                    max="23"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minute">分钟(0-59)</Label>
                  <Input
                    id="minute"
                    type="number"
                    placeholder="0"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    required
                    min="0"
                    max="59"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">出生城市</Label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="北京">北京</option>
                    <option value="上海">上海</option>
                    <option value="广州">广州</option>
                    <option value="深圳">深圳</option>
                    <option value="成都">成都</option>
                    <option value="杭州">杭州</option>
                    <option value="重庆">重庆</option>
                    <option value="西安">西安</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    计算中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    开始计算
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                * 命理内容仅供参考，请理性看待
              </p>
            </form>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Bazi Display */}
            <Card className="p-8 bg-card/80 backdrop-blur-md border-primary/20">
              <h2 className="text-2xl font-bold text-gradient mb-6">您的八字</h2>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {['year', 'month', 'day', 'hour'].map((key, index) => (
                  <div key={key} className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      {['年柱', '月柱', '日柱', '时柱'][index]}
                    </div>
                    <div className="text-4xl font-bold text-gradient">
                      {result.bazi[key as keyof typeof result.bazi]}
                    </div>
                  </div>
                ))}
              </div>

              {/* 真太阳时修正说明 */}
              {(result as any).trueSolarTime && (
                <div className="border-t border-border pt-6 mb-6">
                  <h3 className="text-lg font-semibold mb-2">真太阳时修正</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>原始时间：{(result as any).trueSolarTime.original.hour}:{(result as any).trueSolarTime.original.minute.toString().padStart(2, '0')}</p>
                    <p>修正时间：{(result as any).trueSolarTime.corrected.hour}:{(result as any).trueSolarTime.corrected.minute.toString().padStart(2, '0')}</p>
                    <p className="text-primary">{(result as any).trueSolarTime.note}</p>
                  </div>
                </div>
              )}

              {/* Wuxing Analysis */}
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold mb-4">五行分析</h3>
                <div className="grid grid-cols-5 gap-4 mb-4">
                  {Object.entries(result.wuxingAnalysis).map(([element, count]) => (
                    <div key={element} className="text-center">
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <div className="text-sm text-muted-foreground">{element}</div>
                    </div>
                  ))}
                </div>
                {result.lackingWuxing.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    缺少五行：<span className="text-primary font-semibold">{result.lackingWuxing.join('、')}</span>
                  </div>
                )}
              </div>

              {/* 专业解读（可展开） */}
              {!showProfessional && (
                <div className="border-t border-border pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowProfessional(true)}
                    className="w-full"
                  >
                    查看专业解读（格局、用神、十神）
                  </Button>
                </div>
              )}

              {showProfessional && (
                <>
                  {/* 十神分析 */}
                  {(result as any).shishenAnalysis && (
                    <div className="border-t border-border pt-6">
                      <h3 className="text-xl font-semibold mb-4">十神分析</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {['year', 'month', 'day', 'hour'].map((key, index) => (
                          <div key={key} className="text-center">
                            <div className="text-sm text-muted-foreground mb-2">
                              {['年柱', '月柱', '日柱', '时柱'][index]}
                            </div>
                            <div className="text-lg font-semibold text-primary">
                              {(result as any).shishenAnalysis[key].gan}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 格局判断 */}
                  {(result as any).pattern && (
                    <div className="border-t border-border pt-6">
                      <h3 className="text-xl font-semibold mb-4">格局判断</h3>
                      <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                        <p className="text-lg font-semibold text-primary mb-2">
                          {(result as any).pattern.pattern}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(result as any).pattern.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 用神分析 */}
                  {(result as any).yongshen && (
                    <div className="border-t border-border pt-6">
                      <h3 className="text-xl font-semibold mb-4">用神分析</h3>
                      <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                        <p className="text-lg font-semibold text-primary mb-2">
                          用神：{(result as any).yongshen.yongshen}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(result as any).yongshen.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 日主强弱 */}
                  {(result as any).dayMasterStrength && (
                    <div className="border-t border-border pt-6">
                      <h3 className="text-xl font-semibold mb-4">日主强弱</h3>
                      <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                        <p className="text-lg font-semibold text-primary">
                          {(result as any).dayMasterStrength}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* AI Reading */}
            <Card className="p-8 bg-card/80 backdrop-blur-md border-primary/20">
              <h2 className="text-2xl font-bold text-gradient mb-6">AI命理解读</h2>
              
              <div className="mb-6">
                <div className="flex gap-2 mb-4 border-b border-border">
                  {[
                    { key: 'basic', label: '基础解读' },
                    { key: 'professional', label: '专业解读' },
                    { key: 'scenario', label: '场景建议' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveReadingTab(tab.key);
                        handleAiReading(tab.key);
                      }}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeReadingTab === tab.key
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      disabled={isLoadingReading}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {['general', 'career', 'love', 'wealth', 'health'].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAiReading(type)}
                      disabled={isLoadingReading}
                    >
                      {{
                        general: '综合运势',
                        career: '事业运势',
                        love: '感情运势',
                        wealth: '财富运势',
                        health: '健康运势',
                      }[type]}
                    </Button>
                  ))}
                </div>
              </div>

              {isLoadingReading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {aiReading && !isLoadingReading && (
                <div className="bg-background/50 rounded-lg p-6 border border-primary/20">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {aiReading}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                      * 以上解读仅供参考，人生决策请结合实际判断
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setRecordId("");
                setAiReading("");
                setShowProfessional(false);
                setActiveReadingTab("basic");
              }}
              className="w-full"
            >
              重新测算
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bazi;
