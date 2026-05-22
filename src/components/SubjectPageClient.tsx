
'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClassVaultHeader } from '@/components/ClassVaultHeader';
import { NoteCard } from '@/components/NoteCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Clock, SortAsc, AlertCircle, FileText, ChevronLeft } from 'lucide-react';
import { useFirestore, useCollection, useDoc, useRole } from '@/firebase';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SubjectPageClient() {
  const params = useParams();
  const subjectId = params?.subjectId;
  const router = useRouter();
  const db = useFirestore();
  const { role } = useRole();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az'>('newest');

  const subjectRef = useMemo(() => db && subjectId ? doc(db, 'subjects', subjectId as string) : null, [db, subjectId]);
  const notesQuery = useMemo(() => db && subjectId ? query(collection(db, 'notes'), where('subjectId', '==', subjectId)) : null, [db, subjectId]);

  const { data: subject, loading: subjectLoading, error: subjectError } = useDoc(subjectRef);
  const { data: notes, loading: notesLoading, error: notesError } = useCollection(notesQuery);

  const isAdmin = role === 'admin';

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    let result = [...notes];
    
    if (searchTerm) {
      result = result.filter(n => 
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.chapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeTab === 'free') result = result.filter(n => !n.isPremium);
    else if (activeTab === 'premium') result = result.filter(n => n.isPremium);
    
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'newest') return (b.uploadDate?.seconds || 0) - (a.uploadDate?.seconds || 0);
      if (sortBy === 'oldest') return (a.uploadDate?.seconds || 0) - (b.uploadDate?.seconds || 0);
      if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
    
    return result;
  }, [notes, searchTerm, activeTab, sortBy]);

  const handleDeleteNote = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'notes', id));
      toast({ title: "Material Removed Successfully" });
    } catch (e) { toast({ variant: "destructive", title: "Action Failed" }); }
  };

  if (subjectError || notesError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ClassVaultHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in">
          <div className="bg-rose-500/10 p-8 rounded-[3rem] border border-rose-500/20"><AlertCircle className="h-20 w-20 text-rose-500" /></div>
          <div className="space-y-3">
            <h2 className="text-4xl font-headline font-bold tracking-tight">Library Connection Failed</h2>
            <p className="text-muted-foreground text-xl max-w-sm mx-auto leading-relaxed">We encountered a secure vault synchronization issue.</p>
          </div>
          <Button className="rounded-[1.5rem] h-14 sm:h-16 px-12 text-lg font-bold shadow-xl active:scale-95 transition-all" onClick={() => window.location.reload()}>Retry Secure Connection</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ClassVaultHeader />
      <main className="flex-1">
        <div className={cn("relative border-b py-20 sm:py-32 overflow-hidden transition-all duration-1000", subjectLoading ? "bg-muted/50" : subject?.colorBanner || 'bg-primary/5')}>
          {subject?.bannerType === 'image' && subject?.thumbnail && (
            <img src={subject.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none transition-all duration-1000 group-hover:scale-110" alt="" />
          )}
          <div className="container mx-auto px-4 relative z-10 space-y-8 max-w-7xl">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/subjects')} className="rounded-xl h-10 w-10 bg-white/20 dark:bg-black/20 backdrop-blur-md hover:bg-white/40 dark:hover:bg-black/40 border border-white/10 active:scale-90 transition-all">
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </Button>
              <Badge className="bg-white/30 dark:bg-black/30 backdrop-blur-md text-foreground border-white/20 shadow-sm px-6 py-2 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px]">
                {notesLoading ? 'Syncing...' : `${notes?.length || 0} Elite Resources`}
              </Badge>
            </div>
            {subjectLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-14 sm:h-20 w-full max-w-2xl rounded-2xl" />
                <Skeleton className="h-8 w-full max-w-xl rounded-xl" />
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-8xl font-headline font-bold text-foreground leading-[1.05] tracking-tight">{subject?.name}</h1>
                <p className="text-muted-foreground text-lg sm:text-2xl max-w-3xl leading-relaxed opacity-80">{subject?.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 sm:py-20 space-y-16 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-card p-6 sm:p-10 rounded-[3rem] shadow-sm border border-primary/5">
            <div className="relative w-full lg:max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Topic, chapter or keyword..." 
                className="pl-16 h-16 rounded-2xl border-2 text-lg focus:ring-primary shadow-inner bg-muted/20" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-muted p-1.5 rounded-2xl border shadow-inner">
                <TabsList className="bg-transparent h-12 gap-1">
                  <TabsTrigger value="all" className="rounded-xl px-8 font-bold data-[state=active]:bg-background shadow-none transition-all">All</TabsTrigger>
                  <TabsTrigger value="free" className="rounded-xl px-8 font-bold data-[state=active]:bg-background shadow-none transition-all">Free</TabsTrigger>
                  <TabsTrigger value="premium" className="rounded-xl px-8 font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 shadow-none transition-all">Elite</TabsTrigger>
                </TabsList>
              </Tabs>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-2xl h-14 sm:h-16 px-8 gap-3 border-2 font-bold shadow-sm transition-all active:scale-95">
                    <SortAsc className="h-5 w-5 opacity-60" /> 
                    {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'A - Z'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-2xl p-2 w-56 shadow-2xl border-primary/10" align="end">
                  <DropdownMenuItem onClick={() => setSortBy('newest')} className="rounded-xl h-12 font-bold gap-3">
                    <Clock className="h-4 w-4 opacity-60" /> Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')} className="rounded-xl h-12 font-bold gap-3">
                    <Clock className="h-4 w-4 opacity-60" /> Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('az')} className="rounded-xl h-12 font-bold gap-3">
                    <SortAsc className="h-4 w-4 opacity-60" /> Alphabetical
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isAdmin && (
                <Button onClick={() => router.push('/admin')} className="rounded-2xl h-14 sm:h-16 px-10 font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                  <Plus className="h-5 w-5 mr-3" /> Add Material
                </Button>
              )}
            </div>
          </div>

          {notesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[450px] bg-muted/50 rounded-[3rem] animate-pulse" />
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {filteredNotes.map(note => <NoteCard key={note.id} note={note as any} isAdmin={isAdmin} onDelete={handleDeleteNote} />)}
            </div>
          ) : (
            <div className="py-48 text-center text-muted-foreground flex flex-col items-center gap-8 animate-in fade-in">
              <div className="bg-muted p-12 rounded-full shadow-inner">
                <FileText className="h-20 w-20 opacity-10" />
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-bold tracking-tight text-foreground/80">No matching resources.</p>
                <p className="text-xl opacity-60 max-w-sm mx-auto leading-relaxed">{searchTerm ? `We couldn't find anything matching "${searchTerm}".` : 'This subject library is currently waiting for elite content.'}</p>
              </div>
              {searchTerm && <Button variant="ghost" className="font-bold text-primary hover:bg-primary/5 rounded-xl h-12 px-8" onClick={() => setSearchTerm('')}>Clear Search Filter</Button>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
