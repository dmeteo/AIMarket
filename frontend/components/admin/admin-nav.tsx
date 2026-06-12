import {
  LayoutDashboard,
  FileText,
  Users,
  Store,
  UserCircle,
  BarChart3,
} from 'lucide-react';

export const adminNavItems = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/admin/applications', label: 'Заявки', icon: <FileText className="h-5 w-5" /> },
  { href: '/admin/sellers', label: 'Продавцы', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/shops', label: 'Магазины', icon: <Store className="h-5 w-5" /> },
  { href: '/admin/users', label: 'Пользователи', icon: <UserCircle className="h-5 w-5" /> },
  { href: '/admin/analytics', label: 'Аналитика', icon: <BarChart3 className="h-5 w-5" /> },
];
