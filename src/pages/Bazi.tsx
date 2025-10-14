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
  const [result, setResult] = useState<BaziResult | null>(null);
  const [recordId, setRecordId] = useState<string>("");
  const [aiReading, setAiReading] = useState<string>("");
  const [isLoadingReading, setIsLoadingReading] = useState(false);

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
            </Card>

            {/* AI Reading */}
            <Card className="p-8 bg-card/80 backdrop-blur-md border-primary/20">
              <h2 className="text-2xl font-bold text-gradient mb-6">AI命理解读</h2>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {['general', 'career', 'love', 'wealth', 'health'].map((type) => (
                  <Button
                    key={type}
                    variant="mystical"
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
                </div>
              )}
            </Card>

            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setRecordId("");
                setAiReading("");
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
