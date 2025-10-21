import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const [isOpen, setIsOpen] = useState(false);

  const quickLinks = [
    { icon: Home, label: '首页', path: '/', color: 'text-primary' },
    { icon: Calculator, label: '八字测算', path: '/bazi', color: 'text-purple-500' },
    { icon: Compass, label: '风水分析', path: '/fengshui', color: 'text-amber-500' },
    { icon: MessageSquare, label: 'AI对话', path: '/chat', color: 'text-blue-500' },
    { icon: BookOpen, label: '学习中心', path: '/learning', color: 'text-green-500' },
    { icon: Gift, label: '邀请好友', path: '/referral', color: 'text-pink-500' },
    { icon: Crown, label: '会员中心', path: '/membership', color: 'text-amber-600' },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
        size="icon"
        variant={isOpen ? 'destructive' : 'default'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Quick Navigation Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Card */}
          <Card className="fixed bottom-24 right-6 w-72 p-4 z-50 shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <div className="pb-2 mb-2 border-b border-border">
                <h3 className="font-semibold text-sm text-muted-foreground">快速导航</h3>
              </div>
              
              {quickLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="ghost"
                  className="w-full justify-start gap-3 hover:bg-primary/10"
                  onClick={() => {
                    navigate(link.path);
                    setIsOpen(false);
                  }}
                >
                  <link.icon className={`w-5 h-5 ${link.color}`} />
                  <span className="text-sm">{link.label}</span>
                </Button>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
};
