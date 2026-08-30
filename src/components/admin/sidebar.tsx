'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquareText,
  Settings,
  QrCode,
  LogOut,
  Menu,
  X,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reviews', label: 'Reviews', icon: MessageSquareText },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/qr-code', label: 'QR Code', icon: QrCode },
];

interface AdminSidebarProps {
  businessName: string;
  userEmail: string;
}

function NavContent({ businessName, userEmail, onItemClick }: AdminSidebarProps & { onItemClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-[#E5E7EB]">
        <div className="w-9 h-9 bg-[#4F46E5] rounded-xl flex items-center justify-center flex-shrink-0">
          <Star className="w-4.5 h-4.5 text-white" fill="white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#111827] truncate">ReviewFlow AI</p>
          <p className="text-xs text-[#9CA3AF] truncate">{businessName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                onItemClick?.();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'text-[#4F46E5]' : 'text-[#9CA3AF]')} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-[#4F46E5] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-[#4F46E5]">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#111827] truncate">{userEmail}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl text-sm"
          id="logout-btn"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar({ businessName, userEmail }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E5E7EB]">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="rounded-xl" id="mobile-menu-btn" />}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <NavContent
              businessName={businessName}
              userEmail={userEmail}
              onItemClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#4F46E5] rounded-lg flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="text-sm font-bold text-[#111827]">ReviewFlow AI</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#E5E7EB]">
        <NavContent businessName={businessName} userEmail={userEmail} />
      </aside>
    </>
  );
}
