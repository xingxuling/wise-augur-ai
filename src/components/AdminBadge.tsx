import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';

export const AdminBadge = () => {
  const { role, loading } = useUserRole();

  if (loading || role === 'user') return null;

  return (
    <Badge 
      variant={role === 'admin' ? 'destructive' : 'default'}
      className="gap-1"
    >
      <Shield className="w-3 h-3" />
      {role === 'admin' ? '管理员' : 'VIP'}
    </Badge>
  );
};
