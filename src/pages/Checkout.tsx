import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { REGIONS, getRegionByValue, PAYMENT_METHODS } from "@/lib/regions";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PlanType = 'basic' | 'advanced' | 'premium';

const PLAN_INFO = {
  basic: { name: "基础版", price: { CNY: 88, HKD: 128, MOP: 128, TWD: 380 } },
  advanced: { name: "进阶版", price: { CNY: 288, HKD: 388, MOP: 388, TWD: 1180 } },
  premium: { name: "尊享版", price: { CNY: 888, HKD: 1188, MOP: 1188, TWD: 3680 } },
};

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [pendingSubscription, setPendingSubscription] = useState<{
    planType: PlanType;
    region: string;
  } | null>(null);

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "请先登录",
          description: "需要登录才能购买会员",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // 获取待支付的订阅信息
      const saved = localStorage.getItem('pending_subscription');
      if (!saved) {
        toast({
          title: "订阅信息丢失",
          description: "请重新选择会员套餐",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        const data = JSON.parse(saved);
        setPendingSubscription(data);
      } catch (error) {
        toast({
          title: "数据错误",
          description: "请重新选择会员套餐",
          variant: "destructive",
        });
        navigate("/");
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, toast]);

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast({
        title: "请选择支付方式",
        variant: "destructive",
      });
      return;
    }

    if (!pendingSubscription) return;

    setIsProcessing(true);

    try {
      const regionData = getRegionByValue(pendingSubscription.region);
      const planInfo = PLAN_INFO[pendingSubscription.planType];
      const amount = planInfo.price[regionData.currency as keyof typeof planInfo.price];

      // Stripe支付处理
      if (selectedPayment === 'stripe' || selectedPayment === 'credit_card') {
        const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
          body: {
            planType: pendingSubscription.planType,
            region: pendingSubscription.region,
            amount,
            currency: regionData.currency,
          },
        });

        if (error) {
          throw new Error(error.message || '创建支付会话失败');
        }

        if (data?.url) {
          // 重定向到Stripe Checkout页面
          window.location.href = data.url;
          return;
        }
      } else {
        // 本地支付方式（微信/支付宝/银联）
        toast({
          title: "本地支付功能开发中",
          description: `${planInfo.name} - ${regionData.displayCurrency}${amount}/月\n支付方式：${selectedPayment}\n\n需要对接当地支付商户`,
        });

        // 模拟支付成功
        setTimeout(() => {
          localStorage.removeItem('pending_subscription');
          navigate("/");
        }, 2000);
      }

    } catch (error) {
      console.error('支付处理错误:', error);
      toast({
        title: "支付失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !pendingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const regionData = getRegionByValue(pendingSubscription.region);
  const planInfo = PLAN_INFO[pendingSubscription.planType];
  const amount = planInfo.price[regionData.currency as keyof typeof planInfo.price];
  const paymentMethods = PAYMENT_METHODS[regionData.currency as keyof typeof PAYMENT_METHODS] || PAYMENT_METHODS.CNY;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12">
      <div className="container px-4 mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <h1 className="text-4xl font-bold text-gradient mb-2">确认订阅</h1>
          <p className="text-muted-foreground">安全支付 · 数据加密保护</p>
        </div>

        {/* Order Summary */}
        <Card className="p-6 mb-6 bg-card/80 backdrop-blur-md border-primary/20">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            订单详情
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">套餐</span>
              <span className="font-semibold">{planInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">地区</span>
              <span className="font-semibold">{regionData.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">订阅周期</span>
              <span className="font-semibold">1个月</span>
            </div>
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">应付金额</span>
                <span className="text-2xl font-bold text-gradient">
                  {regionData.displayCurrency}{amount}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6 mb-6 bg-card/80 backdrop-blur-md border-primary/20">
          <h2 className="text-xl font-bold mb-4">选择支付方式</h2>
          <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedPayment === method.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPayment(method.value)}
                >
                  <RadioGroupItem value={method.value} id={method.value} />
                  <Label htmlFor={method.value} className="flex items-center gap-3 cursor-pointer flex-1">
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </Card>

        {/* Security Notice */}
        <Card className="p-4 mb-6 bg-card/50 backdrop-blur-md border-primary/10">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">安全保障</p>
              <p className="text-muted-foreground">
                {regionData.currency === 'HKD' && "遵循香港金融管理局支付规则"}
                {regionData.currency === 'MOP' && "遵循澳门金融管理局支付规则"}
                {regionData.currency === 'TWD' && "遵循台湾地区金融监管规则"}
                {regionData.currency === 'CNY' && "遵循中国人民银行支付规则"}
                ，您的支付信息将被加密保护
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                目前支持银联卡和国际信用卡支付，更多支付方式即将上线
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handlePayment}
          disabled={!selectedPayment || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              处理中...
            </>
          ) : (
            `确认支付 ${regionData.displayCurrency}${amount}`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          点击"确认支付"即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
};

export default Checkout;
