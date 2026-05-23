
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ClassVaultHeader } from '@/components/ClassVaultHeader';
import { SearchNotes } from '@/components/SearchNotes';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calculator, Globe, Laptop, Languages, Beaker, Bell, ArrowRight, TrendingUp, User, ShieldAlert, Zap, Trophy, Brain, ChevronRight, Pin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRole, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc, where, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { ClassVaultLogo } from '@/components/ClassVaultLogo';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, any> = {
  Beaker, Calculator, BookOpen, Globe, Languages, Laptop, Brain,
};

export default function Home() {
  const { role, setRole, isLoadingRole } = useRole();
  const db = useFirestore();
  const [showSplash, setShowSplash] = useState(true);

  const isAdmin = role === 'admin';

  // Memoized Firestore Queries - Only run if role is set to avoid permission errors on selection screen
  const configDocRef = useMemo(() => (db && role) ? doc(db, 'settings', 'homeConfig') : null, [db, role]);
  const { data: config, loading: configLoading } = useDoc(configDocRef, { silent: true });
  
  const homeConfig = useMemo(() => ({
    welcomeText: config?.welcomeText || 'Master Your Subjects with Precision Notes',
    homeDescription: config?.homeDescription || 'Access the full library of professional study materials.',
    featuredMessage: config?.featuredMessage || 'Revolutionizing Academic Excellence',
    visibleSections: config?.visibleSections || ['hero', 'updates', 'pulse', 'subjects', 'latest']
  }), [config]);

  const [now, setNow] = useState<Timestamp | null>(null);
  
  useEffect(() => {
    setNow(Timestamp.now());
    const timer = setTimeout(() => setShowSplash(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const latestNotesQuery = useMemo(() => 
    (db && role) ? query(collection(db, 'notes'), orderBy('isPinned', 'desc'), orderBy('uploadDate', 'desc'), limit(4)) : null
  , [db, role]);
  const { data: latestNotes, loading: notesLoading } = useCollection(latestNotesQuery, { silent: true });

  const announcementsQuery = useMemo(() => 
    (db && now && role) ? query(
      collection(db, 'announcements'), 
      where('publishDate', '<=', now),
      orderBy('publishDate', 'desc'),
      limit(3)
    ) : null
  , [db, now, role]);
  const { data: announcements, loading: announcementsLoading, error: announcementsError } = useCollection(announcementsQuery, { silent: true });

  const subjectsQuery = useMemo(() => (db && role) ? collection(db, 'subjects') : null, [db, role]);
  const { data: subjects, loading: subjectsLoading } = useCollection(subjectsQuery, { silent: true });

  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-8 text-center px-4 animate-in fade-in zoom-in duration-300">
          <ClassVaultLogo iconOnly className="scale-[2] animate-bounce-slow" />
          <div className="space-y-3">
            <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">ClassVault</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.5em] opacity-60">Elite Academic Access</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingRole) return null;

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-700">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden group bg-card">
            <CardHeader className="text-center pt-16">
              <div className="bg-primary/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 text-primary">
                <User className="h-12 w-12" />
              </div>
              <CardTitle className="text-4xl font-headline font-bold">Student Hub</CardTitle>
              <CardDescription className="text-xl mt-4 px-8 opacity-70">Access the full library of professional study materials.</CardDescription>
            </CardHeader>
            <CardContent className="pb-16 pt-8 px-12 text-center">
              <Button size="lg" className="w-full rounded-[1.5rem] h-16 text-xl font-bold shadow-xl active:scale-95 transition-all" onClick={() => setRole('student')}>
                Continue as Student
              </Button>
            </CardContent>
          </Card>
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden group bg-card">
            <CardHeader className="text-center pt-16">
              <div className="bg-blue-50 dark:bg-blue-900/30 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-all duration-500 text-blue-600 dark:text-blue-400">
                <ShieldAlert className="h-12 w-12" />
              </div>
              <CardTitle className="text-4xl font-headline font-bold">Admin Portal</CardTitle>
              <CardDescription className="text-xl mt-4 px-8 opacity-70">Secure system management for educators.</CardDescription>
            </CardHeader>
            <CardContent className="pb-16 pt-8 px-12 text-center">
              <Button variant="outline" size="lg" className="w-full rounded-[1.5rem] h-16 text-xl font-bold border-2 active:scale-95 transition-all" onClick={() => window.location.href = '/admin'}>
                Admin Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500">
      <ClassVaultHeader />
      
      <main className="flex-1">
        {homeConfig.visibleSections.includes('hero') && (
          <section className="bg-gradient-to-b from-primary/10 via-background to-background pt-12 sm:pt-20 pb-16 sm:pb-24 border-b">
            <div className="container mx-auto px-4 text-center space-y-10 sm:space-y-12">
              <div className="max-w-4xl mx-auto space-y-6 px-4">
                {configLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-8 w-48 rounded-full" />
                    <Skeleton className="h-16 w-full max-w-2xl rounded-2xl" />
                  </div>
                ) : (
                  <>
                    <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-4">
                      {homeConfig.featuredMessage}
                    </Badge>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-headline font-bold tracking-tight text-foreground leading-[1.1]">
                      {homeConfig.welcomeText}
                    </h1>
                    <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed opacity-70 mt-4">
                      {homeConfig.homeDescription}
                    </p>
                  </>
                )}
              </div>
              <SearchNotes />
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-16 sm:py-24 space-y-24 sm:space-y-32">
          {homeConfig.visibleSections.includes('updates') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between border-b border-primary/10 pb-6">
                  <h2 className="text-2xl sm:text-3xl font-headline font-bold flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-xl"><Bell className="h-6 w-6 text-primary" /></div>
                    Latest Updates
                  </h2>
                  <Button variant="ghost" asChild className="rounded-xl font-bold text-primary hover:bg-primary/5 transition-all">
                    <Link href="/announcements" className="gap-2">All Broadcasts <ChevronRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {announcementsLoading ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem]" />) : 
                  announcementsError ? (
                    <div className="p-10 text-center bg-rose-50 dark:bg-rose-950/20 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 space-y-4">
                      <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                      <p className="font-bold text-rose-800 dark:text-rose-400">Failed to load system updates</p>
                      <Button variant="outline" size="sm" className="rounded-xl border-rose-200" onClick={() => window.location.reload()}>Retry Connection</Button>
                    </div>
                  ) :
                  announcements && announcements.length > 0 ? (
                    announcements.map((ann) => (
                      <Card key={ann.id} className={cn("border-none shadow-sm rounded-[2rem] group border-l-8 transition-all hover:shadow-lg", ann.isPinned ? "border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10" : "border-l-primary bg-card")}>
                        <CardHeader className="p-6 sm:p-8">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                              {ann.isPinned && <Pin className="h-5 w-5 text-amber-500 fill-amber-500" />}
                              {ann.title}
                            </CardTitle>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-4 py-1.5 rounded-full shrink-0 tracking-widest uppercase">
                              {ann.publishDate?.toDate ? ann.publishDate.toDate().toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          <CardDescription className="text-base sm:text-lg mt-5 line-clamp-2 leading-relaxed opacity-80">{ann.message}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))
                  ) : (
                    <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-[3rem] bg-muted/20 italic opacity-50">
                      No updates broadcasted yet.
                    </div>
                  )}
                </div>
              </div>

              {homeConfig.visibleSections.includes('pulse') && (
                <Card className="bg-slate-950 text-white h-fit lg:sticky lg:top-24 rounded-[3rem] relative border-none shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
                  <CardHeader className="p-8 sm:p-10 border-b border-white/5">
                    <CardTitle className="text-2xl sm:text-3xl font-bold">Platform Pulse</CardTitle>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Live Statistics</p>
                  </CardHeader>
                  <CardContent className="space-y-10 p-8 sm:p-10">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-8">
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-lg text-white/60 font-medium">Elite Assets</span>
                        {notesLoading ? <Skeleton className="h-10 w-16 bg-white/10 rounded-xl" /> : <span className="text-3xl sm:text-4xl font-bold text-primary">{latestNotes?.length || 0}+</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-lg text-white/60 font-medium">Subjects</span>
                        {subjectsLoading ? <Skeleton className="h-10 w-16 bg-white/10 rounded-xl" /> : <span className="text-3xl sm:text-4xl font-bold text-primary">{subjects?.length || 0}</span>}
                      </div>
                    </div>
                    <Button variant="secondary" className="w-full h-14 sm:h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" asChild>
                      <Link href="/subjects">Browse Library</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {homeConfig.visibleSections.includes('subjects') && (
            <section className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/10 pb-8 gap-6">
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-5xl font-headline font-bold">Subject Library</h2>
                  <p className="text-muted-foreground text-lg opacity-70">Explore elite curated resources by category.</p>
                </div>
                <Button variant="ghost" asChild className="rounded-xl font-bold text-primary text-lg px-6 hover:bg-primary/5">
                  <Link href="/subjects" className="gap-3">View All Directory <ArrowRight className="h-5 w-5" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {subjectsLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 sm:h-56 rounded-[2.5rem]" />) : 
                subjects?.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-[3rem] bg-muted/10 opacity-50">
                    No subjects defined in the vault.
                  </div>
                ) : (
                  subjects?.map((subject) => {
                    const Icon = iconMap[subject.iconName] || BookOpen;
                    return (
                      <Link key={subject.id} href={`/subjects/${subject.id}`} className="group transition-transform active:scale-95">
                        <Card className="h-full flex flex-col items-center justify-center p-6 sm:p-10 gap-5 text-center rounded-[2.5rem] bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                          <div className={cn("p-5 sm:p-7 rounded-[2rem] transition-all duration-500 group-hover:scale-110 shadow-sm", subject.colorBanner || 'bg-primary/5')}>
                            <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary transition-all group-hover:text-primary dark:group-hover:text-primary-foreground" />
                          </div>
                          <h3 className="font-headline font-bold text-base sm:text-lg leading-tight tracking-tight">{subject.name}</h3>
                        </Card>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {homeConfig.visibleSections.includes('latest') && (
            <section className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/10 pb-8 gap-6">
                <h2 className="text-3xl sm:text-5xl font-headline font-bold flex items-center gap-5">
                  <div className="bg-primary/10 p-2.5 rounded-2xl"><TrendingUp className="h-8 w-8 text-primary" /></div>
                  Latest Releases
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {notesLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[450px] rounded-[2.5rem]" />) : 
                latestNotes?.length === 0 ? (
                  <div className="col-span-full py-24 text-center text-muted-foreground border-2 border-dashed rounded-[3rem] bg-muted/10 italic opacity-50">
                    No materials published yet.
                  </div>
                ) : (
                  latestNotes?.map((note) => <NoteCard key={note.id} note={note as any} isAdmin={isAdmin} />)
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="border-t bg-muted/10 py-16 sm:py-24 mt-20">
        <div className="container mx-auto px-4 text-center space-y-10">
          <ClassVaultLogo className="mx-auto mb-8 opacity-80" />
          <div className="flex justify-center gap-8 text-sm font-bold opacity-40 uppercase tracking-widest">
            <Link href="/" className="hover:text-primary transition-colors">Support</Link>
            <Link href="/" className="hover:text-primary transition-colors">Legal</Link>
            <Link href="/" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
          <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} ClassVault. Elite Academic Access.</p>
        </div>
      </footer>
    </div>
  );
}
