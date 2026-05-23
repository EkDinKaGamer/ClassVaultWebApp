
'use client';

import { useMemo } from 'react';
import { ClassVaultHeader } from '@/components/ClassVaultHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Book, GraduationCap, Calculator, Laptop, Globe, Rocket, Pencil, 
  Lightbulb, Atom, Variable, Code, Sparkles, School, FileText, 
  Trophy, Target, Brain, Orbit, TestTube, ChevronRight, Plus, FlaskConical 
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useCollection, useRole } from '@/firebase';
import { collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Book, GraduationCap, Calculator, Laptop, Globe, Rocket, Pencil, 
  Lightbulb, Atom, Variable, Code, Sparkles, School, FileText, 
  Trophy, Target, Brain, Orbit, TestTube, FlaskConical
};

export default function SubjectsPage() {
  const db = useFirestore();
  const { role } = useRole();
  
  const subjectsQuery = useMemo(() => 
    (db && role) ? collection(db, 'subjects') : null
  , [db, role]);

  const { data: subjects } = useCollection(subjectsQuery, { silent: true });
  const isAdmin = role === 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ClassVaultHeader />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-20 max-w-7xl">
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/10 pb-12">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl sm:text-6xl font-headline font-bold tracking-tight leading-tight">Subject Directory</h1>
              <p className="text-lg sm:text-xl text-muted-foreground opacity-70">Select an academic category to explore professional elite study materials.</p>
            </div>
            {isAdmin && (
              <Button asChild className="rounded-[1.5rem] h-14 sm:h-16 px-10 text-lg font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all">
                <Link href="/admin"><Plus className="h-5 w-5 mr-3" /> New Subject</Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {subjects?.map((subject) => {
              const Icon = ICON_MAP[subject.iconName] || Book;
              return (
                <Link key={subject.id} href={`/subjects/${subject.id}`} className="group active:scale-95 transition-transform duration-300">
                  <Card className="h-full border-none shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden relative rounded-[3rem] bg-card flex flex-col group-hover:translate-y-[-8px]">
                    <div className={cn("h-40 sm:h-48 flex items-center justify-center relative overflow-hidden", subject.colorBanner || 'bg-primary/5')}>
                      {subject.bannerType === 'image' && subject.thumbnail ? (
                        <img src={subject.thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      ) : (
                        <div className="bg-white/10 absolute inset-0 mix-blend-overlay" />
                      )}
                      <div className="relative z-10 bg-white/20 dark:bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <Icon className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-2xl" />
                      </div>
                    </div>
                    <CardHeader className="p-8 sm:p-12 flex-grow">
                      <div className="flex items-center justify-between mb-6">
                        <Badge variant="secondary" className="rounded-xl px-4 py-1 font-bold text-[10px] tracking-widest uppercase">Elite Library</Badge>
                        <ChevronRight className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl font-headline font-bold mb-4 tracking-tight leading-snug group-hover:text-primary transition-colors">{subject.name}</CardTitle>
                      <CardDescription className="text-base sm:text-lg line-clamp-2 opacity-70 Granny-relaxed">{subject.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          {!subjects && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-[3rem]" />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
