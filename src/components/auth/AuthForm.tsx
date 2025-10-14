import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }).max(255),
  password: z.string().min(6, { message: "密码至少6个字符" }).max(50),
});

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证输入
    try {
      authSchema.parse({ email, password });
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

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        toast({
          title: "登录成功",
          description: "欢迎回到通胜智慧",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "该邮箱已注册",
              description: "请直接登录或使用其他邮箱",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "注册成功",
            description: "欢迎加入通胜智慧",
          });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-md border-primary/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gradient">
            {isLogin ? "登录账户" : "创建账户"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "开启您的命理之旅" : "加入通胜智慧大家庭"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              className="bg-background/50 border-border focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={50}
              className="bg-background/50 border-border focus:border-primary/50"
            />
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                处理中...
              </>
            ) : (
              <>{isLogin ? "登录" : "注册"}</>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
          >
            {isLogin ? "还没有账户？立即注册" : "已有账户？立即登录"}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground pt-4 border-t border-border">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </Card>
  );
};

export default AuthForm;
