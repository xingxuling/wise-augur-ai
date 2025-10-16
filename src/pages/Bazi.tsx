import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { z } from "zod";
import { REGIONS, getRegionByValue } from "@/lib/regions";
import { CalendarType, formatDate, correctDate, isValidSolarDate, isValidLunarDate, solarToLunar, lunarToSolar, LUNAR_MONTHS, LUNAR_DAYS, lunarMonthNameToNumber, lunarDayNameToNumber } from "@/lib/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedReadingDisplay } from "@/components/reading/EnhancedReadingDisplay";
import { ReadingHistory } from "@/components/reading/ReadingHistory";
import { DayunChart } from "@/components/reading/DayunChart";
import { LiunianAnalysis } from "@/components/reading/LiunianAnalysis";
import { LanguageSelector } from "@/components/LanguageSelector";
import { MembershipBadge } from "@/components/MembershipBadge";
import { useMembership } from "@/hooks/useMembership";
import { useAIUsage } from "@/hooks/useAIUsage";

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
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [lunarMonth, setLunarMonth] = useState("正月");
  const [lunarDay, setLunarDay] = useState("初一");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("0");
  const [region, setRegion] = useState("beijing");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [result, setResult] = useState<BaziResult | null>(null);
  const [recordId, setRecordId] = useState<string>("");
  const [aiReading, setAiReading] = useState<string>("");
  const [isLoadingReading, setIsLoadingReading] = useState(false);
  const [showProfessional, setShowProfessional] = useState(false);
  const [activeReadingTab, setActiveReadingTab] = useState<string>("basic");
  const readingContentRef = useRef<HTMLDivElement>(null);
  const { membership, hasFeature, canUseAI } = useMembership();
  const { usageCount, recordUsage } = useAIUsage();

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
    
    let solarYear = parseInt(year);
    let solarMonth: number;
    let solarDay: number;
    
    // 历法验证与转换
    if (calendarType === 'lunar') {
      // 将农历名称转换为数字
      solarMonth = lunarMonthNameToNumber(lunarMonth);
      solarDay = lunarDayNameToNumber(lunarDay);
      
      // 验证农历日期
      if (!isValidLunarDate(solarYear, solarMonth, solarDay)) {
        const corrected = correctDate(solarYear, solarMonth, solarDay, 'lunar');
        toast({
          title: "农历日期自动修正",
          description: `当前农历日期不存在，已自动调整为${formatDate(corrected)}`,
        });
        solarDay = corrected.day;
      }
      
      // 农历转公历
      const solarDate = lunarToSolar(solarYear, solarMonth, solarDay);
      solarYear = solarDate.year;
      solarMonth = solarDate.month;
      solarDay = solarDate.day;
    } else {
      // 公历日期直接使用
      solarMonth = parseInt(month);
      solarDay = parseInt(day);
      
      // 验证公历日期
      if (!isValidSolarDate(solarYear, solarMonth, solarDay)) {
        toast({
          title: "输入错误",
          description: "请输入有效的公历日期",
          variant: "destructive",
        });
        return;
      }
    }
    
    // 验证时间
    try {
      baziInputSchema.parse({
        year: solarYear,
        month: solarMonth,
        day: solarDay,
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
      const selectedRegion = getRegionByValue(region);
      const { data, error } = await supabase.functions.invoke('bazi-calculate', {
        body: {
          birthYear: solarYear,
          birthMonth: solarMonth,
          birthDay: solarDay,
          birthHour: parseInt(hour),
          birthMinute: parseInt(minute),
          gender: gender,
          region: region, // 使用region代码而不是label
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

    // 检查AI使用次数
    if (!canUseAI(usageCount)) {
      toast({
        title: '使用次数已达上限',
        description: `您本月的AI解读次数已用完，请升级会员或等待下月重置`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingReading(true);
    setAiReading("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-reading', {
        body: {
          baziRecordId: recordId,
          readingType: type,
          userId: user?.id,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'AI解读失败');
      }

      setAiReading(data.reading);
      
      // 记录使用成功后，刷新使用次数
      await recordUsage(recordId);
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
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <div className="flex items-center gap-3">
              {!result && <ReadingHistory onSelectRecord={(record) => {
                setResult(record.result);
                setRecordId(record.id);
                setGender(record.gender as "male" | "female");
              }} />}
              <MembershipBadge />
              <LanguageSelector />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">智能八字解析</h1>
          <p className="text-muted-foreground">输入您的出生信息，获取精准命理分析</p>
        </div>

        {/* Input Form */}
        {!result && (
          <Card className="p-8 bg-card/80 backdrop-blur-md border-primary/20">
            <form onSubmit={handleCalculate} className="space-y-6">
              {/* 历法切换 */}
              <div className="flex items-center justify-center gap-2 p-3 bg-background/50 rounded-lg border border-primary/20">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <Button
                  type="button"
                  variant={calendarType === 'solar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarType('solar')}
                >
                  公历
                </Button>
                <Button
                  type="button"
                  variant={calendarType === 'lunar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarType('lunar')}
                >
                  农历
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  {calendarType === 'solar' ? '公历生日' : '农历生日（按节气）'}
                </span>
              </div>

              {/* 移动端优化：紧凑布局 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm">
                      {calendarType === 'solar' ? '出生年份' : '农历年份'}
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder={calendarType === 'solar' ? '1990' : '如：2024'}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                      min="1900"
                      max="2100"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month" className="text-sm">
                      {calendarType === 'solar' ? '月份' : '农历月份'}
                    </Label>
                    {calendarType === 'solar' ? (
                      <Input
                        id="month"
                        type="number"
                        placeholder="1-12"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                        min="1"
                        max="12"
                        className="text-base"
                      />
                    ) : (
                      <Select value={lunarMonth} onValueChange={setLunarMonth}>
                        <SelectTrigger className="text-base bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {LUNAR_MONTHS.map((m) => (
                            <SelectItem key={m} value={m} className="text-base">
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="day" className="text-sm">
                      {calendarType === 'solar' ? '日期' : '农历日期'}
                    </Label>
                    {calendarType === 'solar' ? (
                      <Input
                        id="day"
                        type="number"
                        placeholder="1-31"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        required
                        min="1"
                        max="31"
                        className="text-base"
                      />
                    ) : (
                      <Select value={lunarDay} onValueChange={setLunarDay}>
                        <SelectTrigger className="text-base bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] bg-background z-50">
                          {LUNAR_DAYS.map((d) => (
                            <SelectItem key={d} value={d} className="text-base">
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-sm">出生地区</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="text-base bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] bg-background z-50">
                        {REGIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value} className="text-base">
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="hour" className="text-sm">出生时辰</Label>
                    <Input
                      id="hour"
                      type="number"
                      placeholder="0-23"
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      required
                      min="0"
                      max="23"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minute" className="text-sm">分钟</Label>
                    <Input
                      id="minute"
                      type="number"
                      placeholder="0-59"
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      required
                      min="0"
                      max="59"
                      className="text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm">性别</Label>
                  <Select value={gender} onValueChange={(value) => setGender(value as "male" | "female")}>
                    <SelectTrigger className="text-base bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="male" className="text-base">男</SelectItem>
                      <SelectItem value="female" className="text-base">女</SelectItem>
                    </SelectContent>
                  </Select>
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
              
              {calendarType === 'lunar' && (
                <p className="text-xs text-center text-primary">
                  农历日期将自动转换为公历进行排盘（基于节气规则）
                </p>
              )}
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

                  {/* 格局判断（升级版：支持特殊格局展示） */}
                  {(result as any).pattern && (
                    <div className="border-t border-border pt-6">
                      <h3 className="text-xl font-semibold mb-4">格局判断</h3>
                      
                      {/* 主格局卡片 */}
                      <div className={`rounded-lg p-4 border-2 mb-4 ${
                        (result as any).pattern.isSpecial 
                          ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary' 
                          : 'bg-background/50 border-primary/20'
                      }`}>
                        {(result as any).pattern.isSpecial && (
                          <div className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded mb-2">
                            特殊格局
                          </div>
                        )}
                        <p className="text-lg font-semibold text-primary mb-2">
                          {(result as any).pattern.pattern}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {(result as any).pattern.description}
                        </p>
                        
                        {/* 特殊格局详细信息 */}
                        {(result as any).pattern.isSpecial && (result as any).pattern.allPatterns && (
                          <div className="mt-4 space-y-3">
                            {(result as any).pattern.allPatterns.map((p: any, idx: number) => (
                              <div key={idx} className="bg-background/80 rounded p-3 border border-border">
                                <p className="text-sm font-semibold text-primary mb-1">
                                  {p.isPrimary ? '主格' : '兼格'}：{p.name}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <span className="font-medium">成格条件：</span>{p.condition}
                                </p>
                                <p className="text-xs text-primary/80">
                                  <span className="font-medium">经典依据：</span>{p.reference}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* 格局说明提示 */}
                      {(result as any).pattern.isSpecial && (
                        <div className="text-xs text-muted-foreground bg-primary/5 rounded p-3 border border-primary/10">
                          <p className="font-medium mb-1">格局解读说明：</p>
                          <ul className="space-y-1 list-disc list-inside">
                            <li>特殊格局需要满足严格的成格条件</li>
                            <li>格局判断基于《三命通会》《滴天髓》等经典著作</li>
                            <li>格局喜忌直接影响大运流年吉凶，建议结合AI专业解读</li>
                            <li>所有解读仅供参考，人生走向取决于自身选择与努力</li>
                          </ul>
                        </div>
                      )}
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
                <div className="flex gap-2 mb-4 border-b border-border overflow-x-auto">
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
                      className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
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
                  <p className="ml-3 text-muted-foreground">AI正在深度分析您的八字...</p>
                </div>
              )}

              {aiReading && !isLoadingReading && (
                <div ref={readingContentRef}>
                  <EnhancedReadingDisplay
                    content={aiReading}
                    baziRecordId={recordId}
                    readingType={activeReadingTab}
                    baziData={result}
                  />
                </div>
              )}
            </Card>

            {/* 大运流年图表 */}
            <DayunChart baziData={result} gender={gender} />

            {/* 流年分析 */}
            <LiunianAnalysis
              baziRecordId={recordId}
              birthYear={parseInt(year)}
              baziData={result}
            />

              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setRecordId("");
                  setAiReading("");
                  setShowProfessional(false);
                  setActiveReadingTab("basic");
                  setCalendarType("solar");
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
