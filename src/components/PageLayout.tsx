'use client';

import { useState } from 'react';
import { Sidebar, MobileMenuButton } from '@/components/Sidebar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageLayout({ children, title, subtitle, actions }: PageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-foreground">{title}</h1>
                {subtitle && <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              {actions}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs lg:text-sm text-muted-foreground">
            <p>Basketball Stats Manager © 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
