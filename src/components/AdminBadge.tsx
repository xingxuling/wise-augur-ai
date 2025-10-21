import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';

export const AdminBadge = () => {
  const { role, loading } = useUserRole();
  const navigate = useNavigate();

  if (loading || role === 'user') return null;

  const handleClick = () => {
    if (role === 'admin') {
      navigate('/admin/features');
    }
  };

  return (
    <Badge 
      variant={role === 'admin' ? 'destructive' : 'default'}
      className={`gap-1 ${role === 'admin' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
    >
      <Shield className="w-3 h-3" />
      {role === 'admin' ? '管理员' : 'VIP'}
    </Badge>
  );
};
