
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { ClassVaultHeader } from '@/components/ClassVaultHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Settings, Crown, LogOut, FileText, ShieldCheck, User, Sparkles, Moon, Sun, Trash2, Heart, Loader2, ChevronRight } from 'lucide-react';
import { useRole, useFirestore, useCollection } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { NoteCard } from '@/components/NoteCard';
import { collection, query, where, documentId } from 'firebase/firestore';
import { cn } from '@/lib/utils';

function ProfileSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
        <User className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="space-y-2 text-center">
        <p className="font-bold text-foreground/80 text-xl tracking-tight">Accessing Personal Vault</p>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.5em] font-bold opacity-60">Identity Syncing</p>
      </div>
    </div>
  );
}

function ProfileContent() {
  const { role, setRole, isLoadingRole } = useRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);
  
  const tabParam = searchParams ? searchParams.get('tab') : null;
  const defaultTab = tabParam || 'status';

  const [isDark, setIsDark] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const favoritesQuery = useMemo(() => 
    db && favorites.length > 0 ? query(collection(db, 'notes'), where(documentId(), 'in', favorites.slice(0, 10))) : null
  , [db, favorites]);

  const historyQuery = useMemo(() => 
    db && history.length > 0 ? query(collection(db, 'notes'), where(documentId(), 'in', history.slice(0, 10))) : null
  , [db, history]);

  const { data: favoriteNotes } = useCollection(favoritesQuery);
  const { data: historyNotes } = useCollection(historyQuery);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
      setFavorites(JSON.parse(localStorage.getItem('cv_favorites') || '[]'));
      setHistory(JSON.parse(localStorage.getItem('cv_history') || '[]'));
    }
  }, []);

  useEffect(() => {
    if (isMounted && !isLoadingRole && !role) {
      router.replace('/');
    }
  }, [role, isLoadingRole, router, isMounted]);

  if (!isMounted || isLoadingRole || !role) {
    return <ProfileSkeleton />;
  }

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('cv_theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  const clearHistory = () => {
    localStorage.removeItem('cv_history');
    setHistory([]);
  };

  const isAdmin = role === 'admin';
  const isPremium = role === 'premium-student';

  const handleLogout = () => {
    setRole(null);
    router.push('/');
  };

  const getRoleDisplay = () => {
    if (isAdmin) return 'Administrator';
    if (isPremium) return 'Elite Student';
    return 'Student Member';
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 dark:bg-slate-950">
      <ClassVaultHeader />
      
      <main className="flex-1 container mx-auto px-4 py-10 sm:py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16">
          
          <div className="lg:col-span-4 space-y-10">
            <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem] bg-card">
              <div className="bg-primary/5 dark:bg-primary/10 h-32 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <Avatar className="h-32 w-32 border-[6px] border-card shadow-2xl">
                    <AvatarFallback className={cn("text-4xl font-bold", isAdmin ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" : isPremium ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400" : "bg-primary/10 text-primary")}>
                      {isAdmin ? 'A' : isPremium ? 'P' : 'S'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardHeader className="text-center pb-8 pt-16">
                <CardTitle className="text-3xl font-headline font-bold tracking-tight">{getRoleDisplay()}</CardTitle>
                <CardDescription className="font-bold uppercase tracking-[0.4em] text-[10px] text-primary mt-2">Personal Identity</CardDescription>
                <div className="pt-6 flex justify-center">
                  <Badge variant="outline" className={cn("px-6 h-10 rounded-2xl font-bold text-xs border-2 shadow-sm", isAdmin ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5" : isPremium ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5" : "border-primary text-primary bg-primary/5")}>
                    {isAdmin ? 'ELITE ACCESS' : isPremium ? 'ELITE ACCESS' : 'STANDARD ACCESS'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-4">
                <Button variant="ghost" onClick={toggleTheme} className="w-full justify-between px-6 rounded-2xl h-14 text-foreground/80 font-bold hover:bg-muted/50 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                      {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-primary" />}
                    </div>
                    {isDark ? 'Light Vision' : 'Night Vision'}
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-20" />
                </Button>
                <Button variant="ghost" className="w-full justify-between px-6 rounded-2xl h-14 text-foreground/80 font-bold hover:bg-muted/50 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                      <Settings className="h-5 w-5 opacity-60" />
                    </div>
                    Vault Settings
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-20" />
                </Button>
                <div className="pt-6 mt-6 border-t px-2 pb-2">
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-4 px-6 rounded-2xl h-14 text-destructive hover:bg-destructive/10 hover:text-destructive font-bold transition-all active:scale-95">
                    <LogOut className="h-5 w-5" /> Sign Out from Vault
                  </Button>
                </div>
              </CardContent>
            </Card>

            {!isPremium && !isAdmin && (
              <Card className="bg-slate-950 text-white border-none shadow-2xl overflow-hidden relative rounded-[3rem] group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
                <CardHeader className="p-10">
                  <Crown className="h-12 w-12 mb-8 text-amber-400 animate-pulse" />
                  <CardTitle className="text-3xl font-headline font-bold">Go Elite</CardTitle>
                  <CardDescription className="text-white/60 text-lg mt-4 leading-relaxed">Unlock the full elite library of exam boosters and premium academic guides.</CardDescription>
                </CardHeader>
                <CardFooter className="p-10 pt-0">
                  <Button variant="secondary" className="w-full h-16 font-bold shadow-2xl rounded-2xl text-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" asChild>
                    <Link href="/premium">Get Elite Access</Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-headline font-bold text-foreground leading-tight tracking-tight">Personal Dashboard</h1>
              <p className="text-muted-foreground text-lg opacity-70">Manage your saved materials, history, and vault security.</p>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-12">
              <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto gap-8 sm:gap-12 overflow-x-auto no-scrollbar">
                <TabsTrigger value="status" className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-base sm:text-xl font-bold transition-all text-muted-foreground data-[state=active]:text-foreground shrink-0">
                  Identity
                </TabsTrigger>
                <TabsTrigger value="favorites" className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-base sm:text-xl font-bold transition-all text-muted-foreground data-[state=active]:text-foreground shrink-0">
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="downloads" className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-6 text-base sm:text-xl font-bold transition-all text-muted-foreground data-[state=active]:text-foreground shrink-0">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="bg-card border-none shadow-sm rounded-[3.5rem] overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b p-8 sm:p-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
                      <div className={cn("p-8 rounded-[2.5rem] text-white shadow-2xl transition-all duration-700 hover:rotate-6 active:scale-90", isAdmin ? "bg-blue-600" : isPremium ? "bg-amber-500" : "bg-primary")}>
                        {isAdmin ? <ShieldCheck className="h-16 w-16" /> : isPremium ? <Sparkles className="h-16 w-16" /> : <User className="h-16 w-16" />}
                      </div>
                      <div className="text-center sm:text-left space-y-3">
                        <CardTitle className="text-3xl sm:text-5xl font-bold tracking-tight">{getRoleDisplay()} Access</CardTitle>
                        <CardDescription className="text-lg sm:text-xl font-medium opacity-70 max-w-lg leading-relaxed">
                          {isAdmin ? 'Complete platform management enabled. All security systems operational.' : isPremium ? 'Full access to Elite resources unlocked. You are browsing the premium library.' : 'You are currently browsing as a standard student member.'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 sm:p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-10 bg-muted/20 rounded-[2.5rem] space-y-4 border border-primary/5 hover:bg-muted/40 transition-all duration-500">
                        <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                          <ShieldCheck className="h-7 w-7 text-emerald-500" />
                        </div>
                        <h4 className="font-bold text-2xl tracking-tight">Security Status</h4>
                        <p className="text-muted-foreground text-base opacity-70 leading-relaxed">Encryption Status: Active & Secure. All transactions are logged for your protection.</p>
                      </div>
                      <div className="p-10 bg-muted/20 rounded-[2.5rem] space-y-4 border border-primary/5 hover:bg-muted/40 transition-all duration-500">
                        <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                          <Crown className="h-7 w-7 text-amber-500" />
                        </div>
                        <h4 className="font-bold text-2xl tracking-tight">Access Rights</h4>
                        <p className="text-muted-foreground text-base opacity-70 leading-relaxed">Level: <span className="text-foreground font-bold">{isPremium || isAdmin ? 'Elite Unrestricted' : 'Standard Member'}</span>. View all exclusive content in the library.</p>
                      </div>
                    </div>
                    {(isAdmin || isPremium) && (
                      <div className="pt-10 flex flex-col sm:flex-row gap-6">
                        {isAdmin && (
                          <Button className="rounded-[1.5rem] h-16 sm:h-20 px-12 text-xl font-bold shadow-2xl shadow-primary/20 flex-1 hover:scale-[1.02] active:scale-95 transition-all" asChild>
                            <Link href="/admin">Control Center</Link>
                          </Button>
                        )}
                        <Button variant="outline" className="rounded-[1.5rem] h-16 sm:h-20 px-12 text-xl font-bold border-2 flex-1 hover:bg-muted/50 transition-all active:scale-95" onClick={handleLogout}>
                          Sign Out
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="favorites" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {favoriteNotes && favoriteNotes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favoriteNotes.map(note => <NoteCard key={note.id} note={note as any} isAdmin={isAdmin} />)}
                  </div>
                ) : (
                  <div className="text-center py-32 text-muted-foreground border-2 border-dashed rounded-[4rem] bg-muted/10 opacity-60 flex flex-col items-center">
                    <div className="bg-muted p-10 rounded-full mb-8">
                      <Heart className="h-20 w-20 opacity-20" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-foreground/80">Your Vault is empty.</p>
                    <p className="mt-4 text-lg max-w-sm mx-auto leading-relaxed opacity-60">Click the star icon on any material to save it for quick elite access here.</p>
                    <Button variant="outline" className="mt-10 rounded-2xl h-12 px-8 font-bold border-2" asChild>
                      <Link href="/subjects">Explore Library</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="downloads" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-6 border-b border-primary/5">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-2xl font-bold tracking-tight">Recent Activity</h3>
                    <p className="text-muted-foreground text-sm opacity-60">Materials you have recently accessed.</p>
                  </div>
                  {history.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive font-bold gap-3 hover:bg-destructive/5 rounded-2xl h-12 px-6 transition-all active:scale-95">
                      <Trash2 className="h-4 w-4" /> Wipe Activity Log
                    </Button>
                  )}
                </div>
                {historyNotes && historyNotes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {historyNotes.map(note => <NoteCard key={note.id} note={note as any} isAdmin={isAdmin} />)}
                  </div>
                ) : (
                  <div className="text-center py-32 text-muted-foreground border-2 border-dashed rounded-[4rem] bg-muted/10 opacity-60 flex flex-col items-center">
                    <div className="bg-muted p-10 rounded-full mb-8">
                      <Clock className="h-20 w-20 opacity-20" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-foreground/80">No recent history.</p>
                    <p className="mt-4 text-lg max-w-sm mx-auto leading-relaxed opacity-60">Materials you browse will be automatically logged here for your convenience.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
