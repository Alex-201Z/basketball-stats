'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Calendar,
  Trophy,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Equipes', href: '/teams', icon: Users },
  { name: 'Joueurs', href: '/players', icon: UserCircle },
  { name: 'Matchs', href: '/matches', icon: Calendar },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      admin: { label: 'Admin', color: 'bg-red-500/20 text-red-400' },
      scorer: { label: 'Scorer', color: 'bg-blue-500/20 text-blue-400' },
      viewer: { label: 'Viewer', color: 'bg-gray-500/20 text-gray-400' },
    };
    return badges[role] || badges.viewer;
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Basketball</h1>
              <p className="text-xs text-muted-foreground">Stats Manager</p>
            </div>
          </div>
          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu principal
          </p>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          {session?.user && (
            <div className="rounded-xl bg-sidebar-accent p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                  <UserCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {session.user.name || session.user.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-md',
                      getRoleBadge(session.user.role).color
                    )}>
                      {getRoleBadge(session.user.role).label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Deconnexion
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// Bouton hamburger pour mobile
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-secondary"
      aria-label="Ouvrir le menu"
    >
      <Menu className="h-6 w-6 text-foreground" />
    </button>
  );
}
