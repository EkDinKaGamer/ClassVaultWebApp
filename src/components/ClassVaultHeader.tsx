
'use client';

import Link from 'next/link';
import { LayoutDashboard, BookOpen, Crown, Bell, User, LogOut, ShieldAlert, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useRole, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { ClassVaultLogo } from './ClassVaultLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export function ClassVaultHeader() {
  const { role, setRole } = useRole();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = role === 'admin';
  const isPremium = role === 'premium-student';

  const announcementsQuery = useMemo(() => 
    (db && role) ? query(collection(db, 'announcements'), orderBy('createdAt', 'desc')) : null
  , [db, role]);

  const { data: announcements } = useCollection(announcementsQuery, { silent: true });

  useEffect(() => {
    const savedTheme = localStorage.getItem('cv_theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (announcements) {
      const lastRead = localStorage.getItem('cv_last_read_announcement') || '0';
      const count = announcements.filter(ann => (ann.createdAt?.seconds || 0) > parseInt(lastRead)).length;
      setUnreadCount(count);
    }
  }, [announcements]);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('cv_theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  const navItems = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Updates', href: '/announcements', icon: Bell, badge: unreadCount > 0 },
    { label: 'Elite', href: '/premium', icon: Crown, color: 'text-amber-600' },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 transition-transform active:scale-95">
          <ClassVaultLogo className="scale-75 sm:scale-90 md:scale-100" />
        </Link>

        {/* Desktop/Tablet Navigation Tab Bar */}
        <nav className="hidden lg:flex items-center bg-muted/50 p-1.5 rounded-[1.25rem] border shadow-sm">
          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative group",
                  active 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <ActiveIcon className={cn("h-4 w-4", item.color && !active ? item.color : "")} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-background text-[8px] items-center justify-center text-white font-bold">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 transition-colors">
            {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-primary" />}
          </Button>

          {role ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 sm:h-11 sm:w-11 rounded-full border-2 border-primary/10 p-0 overflow-hidden transition-transform active:scale-90">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className={cn("font-bold text-xs sm:text-sm", isAdmin ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" : isPremium ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" : "bg-primary/10 text-primary")}>
                      {isAdmin ? 'A' : isPremium ? 'P' : 'S'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 rounded-2xl mt-2 shadow-2xl border-primary/10" align="end">
                <DropdownMenuLabel className="p-3">
                  <p className="text-sm font-bold opacity-80">{isAdmin ? 'Administrator' : isPremium ? 'Elite Student' : 'Student Member'}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl h-11 cursor-pointer font-medium">
                  <User className="mr-3 h-4 w-4 opacity-70" /> Profile
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl h-11 cursor-pointer text-blue-600 dark:text-blue-400 font-bold">
                    <ShieldAlert className="mr-3 h-4 w-4" /> Admin Controls
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {setRole(null); router.push('/');}} className="text-destructive rounded-xl h-11 font-bold cursor-pointer">
                  <LogOut className="mr-3 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="rounded-full px-5 sm:px-8 h-9 sm:h-11 font-bold text-xs sm:text-sm shadow-lg shadow-primary/20" onClick={() => router.push('/')}>
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Tab Bar */}
      <div className="lg:hidden border-t bg-background/95 backdrop-blur-md pb-safe">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all relative shrink-0",
                  active ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ActiveIcon className={cn("h-5 w-5", item.color && !active ? item.color : "")} />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-1 right-3 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-background shadow-sm"></span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
