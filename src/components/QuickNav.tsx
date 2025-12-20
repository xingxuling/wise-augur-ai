import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Calculator,
  MessageSquare,
  BookOpen,
  Compass,
  Crown,
  X,
  Menu,
  Home,
  Gift,
} from 'lucide-react';

export const QuickNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // 在这些页面隐藏快速导航
  const hiddenPaths = ['/auth', '/privacy', '/terms', '/guide', '/share'];
  if (hiddenPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  const quickLinks = [
    { icon: Home, label: t('nav.home'), path: '/', color: 'text-primary' },
    { icon: Calculator, label: t('nav.bazi'), path: '/bazi', color: 'text-purple-500' },
    { icon: Compass, label: t('nav.fengshui'), path: '/fengshui', color: 'text-amber-500' },
    { icon: MessageSquare, label: t('nav.chat'), path: '/chat', color: 'text-blue-500' },
    { icon: BookOpen, label: t('nav.learning'), path: '/learning', color: 'text-green-500' },
    { icon: Gift, label: t('features.referral.title'), path: '/referral', color: 'text-pink-500' },
    { icon: Crown, label: t('nav.membership'), path: '/membership', color: 'text-amber-600' },
  ];

  return (
    <>
      {/* Floating Action Button - 移动端优化位置 */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
        size="icon"
        variant={isOpen ? 'destructive' : 'default'}
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
      </Button>

      {/* Quick Navigation Menu - 移动端全屏优化 */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Card - 移动端底部抽屉样式 */}
          <Card className="fixed bottom-16 sm:bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-72 p-3 sm:p-4 z-50 shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300 max-h-[70vh] overflow-y-auto">
            <div className="space-y-1 sm:space-y-2">
              <div className="pb-2 mb-2 border-b border-border">
                <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">{t('nav.home')}</h3>
              </div>
              
              {/* 移动端使用网格布局 */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-0">
                {quickLinks.map((link) => (
                  <Button
                    key={link.path}
                    variant="ghost"
                    className="w-full justify-start gap-2 sm:gap-3 hover:bg-primary/10 h-10 sm:h-auto text-xs sm:text-sm"
                    onClick={() => {
                      navigate(link.path);
                      setIsOpen(false);
                    }}
                  >
                    <link.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${link.color}`} />
                    <span className="truncate">{link.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
};
