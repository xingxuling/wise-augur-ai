import { useMembership } from '@/hooks/useMembership';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Star, Zap } from 'lucide-react';

const TIER_CONFIG = {
  free: {
    label: '免费版',
    icon: null,
    className: 'bg-muted text-muted-foreground',
  },
  basic: {
    label: '基础版',
    icon: Sparkles,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  premium: {
    label: '进阶版',
    icon: Star,
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  vip: {
    label: '尊享版',
    icon: Crown,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
};

export const MembershipBadge = () => {
  const { membership, loading } = useMembership();

  if (loading || !membership) return null;

  const config = TIER_CONFIG[membership.tier];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
};