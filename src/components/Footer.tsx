import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">通胜智慧</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              传承千年命理文化<br />
              赋能现代智慧生活
            </p>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">产品服务</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">八字排盘</li>
              <li className="hover:text-primary transition-colors cursor-pointer">紫微斗数</li>
              <li className="hover:text-primary transition-colors cursor-pointer">风水测算</li>
              <li className="hover:text-primary transition-colors cursor-pointer">AI解读</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">关于我们</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">公司介绍</li>
              <li className="hover:text-primary transition-colors cursor-pointer">团队成员</li>
              <li className="hover:text-primary transition-colors cursor-pointer">联系我们</li>
              <li className="hover:text-primary transition-colors cursor-pointer">加入我们</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">帮助中心</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">使用指南</li>
              <li className="hover:text-primary transition-colors cursor-pointer">隐私政策</li>
              <li className="hover:text-primary transition-colors cursor-pointer">服务条款</li>
              <li className="hover:text-primary transition-colors cursor-pointer">常见问题</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            © 2025 通胜智慧. 保留所有权利.
          </p>
          <p className="text-xs text-muted-foreground">
            本站内容仅供参考，请勿过度迷信 · 量子加密保护用户隐私
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
