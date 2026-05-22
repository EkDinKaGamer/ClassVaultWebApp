
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClassVaultHeader } from '@/components/ClassVaultHeader';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Calendar, Pin, AlertCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AnnouncementsPage() {
  const db = useFirestore();
  const [now, setNow] = useState<Timestamp | null>(null);

  useEffect(() => {
    setNow(Timestamp.now());
  }, []);
  
  const announcementsQuery = useMemo(() => 
    db && now ? query(
      collection(db, 'announcements'), 
      where('publishDate', '<=', now),
      orderBy('publishDate', 'desc')
    ) : null
  , [db, now]);

  const { data: announcements, loading, error } = useCollection(announcementsQuery);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      const newestTime = announcements[0].publishDate?.seconds || 0;
      localStorage.setItem('cv_last_read_announcement', newestTime.toString());
    }
  }, [announcements]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 dark:bg-slate-950">
      <ClassVaultHeader />
      <main className="flex-1 container mx-auto px-4 py-16 sm:py-24 max-w-5xl">
        <div className="text-center space-y-6 mb-20 sm:mb-24 animate-in fade-in duration-1000">
          <div className="bg-primary/10 w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-headline font-bold tracking-tight">Platform Broadcasts</h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-70">Stay updated with elite content releases, system improvements, and academic schedules.</p>
        </div>

        {error ? (
          <div className="p-16 text-center bg-rose-500/10 dark:bg-rose-950/20 rounded-[4rem] border border-rose-500/20 space-y-8 animate-in zoom-in duration-500">
            <AlertCircle className="h-24 w-24 text-rose-500 mx-auto opacity-30 animate-pulse" />
            <div className="space-y-3">
              <h3 className="text-3xl font-headline font-bold text-rose-600 dark:text-rose-400">Sync Failure</h3>
              <p className="text-rose-700/80 dark:text-rose-300/60 text-lg max-w-sm mx-auto">We couldn't reach the broadcast vault. Please verify your connection.</p>
            </div>
            <Button className="rounded-[1.5rem] h-16 px-12 text-lg font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20 active:scale-95 transition-all" onClick={() => window.location.reload()}>Retry Secure Sync</Button>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-16 relative">
            <div className="absolute left-11 sm:left-14 top-12 bottom-12 w-0.5 bg-primary/5 hidden md:block" />
            
            {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[3.5rem] animate-pulse" />) : 
             announcements && announcements.length > 0 ? (
               announcements.map((ann, i) => (
                <div key={ann.id} className="flex flex-col md:flex-row gap-10 sm:gap-16 animate-in fade-in slide-in-from-bottom-10" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="hidden md:flex flex-col items-center pt-10">
                    <div className={cn("z-10 rounded-full p-2.5 border-4 shadow-xl transition-all duration-700", ann.isPinned ? "border-amber-500 bg-amber-500/10" : "border-primary bg-card")}>
                      <div className={cn("w-3 h-3 rounded-full", ann.isPinned ? "bg-amber-500 animate-pulse" : "bg-primary")} />
                    </div>
                  </div>
                  <Card className={cn("border-none shadow-sm rounded-[3.5rem] flex-1 group transition-all duration-700 hover:shadow-2xl hover:translate-y-[-8px] bg-card overflow-hidden", ann.isPinned && "border-l-8 border-amber-500 ring-2 ring-amber-500/10")}>
                    <CardHeader className="p-8 sm:p-12">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={cn("px-5 py-1.5 rounded-xl uppercase font-bold text-[10px] tracking-[0.2em] border-2", ann.isPinned ? "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/5" : "border-primary/50 text-primary bg-primary/5")}>
                            {ann.isPinned ? 'Priority Update' : 'Vault Update'}
                          </Badge>
                          {ann.isPinned && <Pin className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />}
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-60">
                          <Calendar className="h-4 w-4" /> 
                          {ann.publishDate?.toDate ? ann.publishDate.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently Published'}
                        </div>
                      </div>
                      <CardTitle className="text-3xl sm:text-4xl font-headline font-bold group-hover:text-primary transition-colors leading-tight tracking-tight">{ann.title}</CardTitle>
                      <CardDescription className="text-lg sm:text-xl mt-8 leading-relaxed text-foreground opacity-80 font-medium">
                        {ann.message}
                      </CardDescription>
                      <div className="mt-10 flex justify-end opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-4">
                         <ChevronRight className="h-8 w-8 text-primary" />
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              ))
             ) : (
              <div className="py-32 text-center text-muted-foreground border-2 border-dashed rounded-[4rem] bg-muted/10 italic flex flex-col items-center gap-6 animate-in fade-in">
                <Bell className="h-20 w-20 opacity-10" />
                <div className="space-y-2">
                  <p className="text-2xl font-bold tracking-tight text-foreground/80">Vault Broadcasts Clear</p>
                  <p className="text-lg opacity-60">No new announcements have been issued to the vault.</p>
                </div>
              </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}
