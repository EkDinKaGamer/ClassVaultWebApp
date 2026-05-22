'use client';

import { useState, useEffect } from 'react';
import { 
  Lock, FileText, Download, Eye, Trash2, 
  Book, GraduationCap, 
  Calculator, Laptop, Globe, Rocket, Pencil, Lightbulb, Atom, 
  Variable, Code, Sparkles, School, Trophy, Target, Brain, Orbit, TestTube, FlaskConical, Star, Crown, Pin,
  ZoomIn, ZoomOut, Maximize2, Minimize2, AlertCircle, X
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRole, useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

const ICON_MAP: Record<string, any> = {
  Book, GraduationCap, FlaskConical, Calculator, Laptop, 
  Globe, Rocket, Pencil, Lightbulb, Atom, Variable, Code, Sparkles, 
  School, FileText, Trophy, Target, Brain, Orbit, TestTube
};

interface Note {
  id: string;
  title: string;
  subjectId: string;
  chapter: string;
  description: string;
  fileUrl: string;
  fileType: string;
  thumbnail?: string;
  colorBanner?: string;
  iconName?: string;
  bannerType?: 'color' | 'icon' | 'image';
  isPremium: boolean;
  isPinned?: boolean;
  viewCount?: number;
  downloadCount?: number;
  uploadDate: any; 
  premiumPassword?: string;
}

export function NoteCard({ note, isAdmin = false, onDelete }: { note: Note; isAdmin?: boolean; onDelete?: (id: string) => void; }) {
  const { role } = useRole();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewerError, setViewerError] = useState(false);

  const isUnlocked = role === 'admin' || role === 'premium-student';

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('cv_favorites') || '[]');
    setIsFavorite(favorites.includes(note.id));
  }, [note.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('cv_favorites') || '[]');
    const newFavorites = isFavorite ? favorites.filter((id: string) => id !== note.id) : [...favorites, note.id];
    localStorage.setItem('cv_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? "Removed from Favorites" : "Added to Favorites" });
  };

  const trackView = async () => {
    if (!db) return;
    const noteRef = doc(db, 'notes', note.id);
    updateDoc(noteRef, {
      viewCount: increment(1),
      lastOpenedAt: serverTimestamp()
    }).catch(e => {});
  };

  const trackDownload = async () => {
    if (!db) return;
    const noteRef = doc(db, 'notes', note.id);
    updateDoc(noteRef, {
      downloadCount: increment(1),
      lastDownloadedAt: serverTimestamp()
    }).catch(e => {});
  };

  const handleOpen = () => {
    if (note.isPremium && !isUnlocked) {
      setShowPremiumPrompt(true);
      return;
    }
    trackView();
    setShowViewer(true);
  };

  const handleDownload = () => {
    if (note.isPremium && !isUnlocked) {
      setShowPremiumPrompt(true);
      return;
    }
    trackDownload();
    
    let downloadUrl = note.fileUrl;
    if (downloadUrl.includes('drive.google.com') && downloadUrl.includes('/file/d/')) {
      const match = downloadUrl.match(/\/file\/d\/(.+?)\//);
      if (match && match[1]) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    window.open(downloadUrl, '_blank');
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com') && url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/(.+?)\//);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  const BannerIcon = note.iconName ? (ICON_MAP[note.iconName] || FileText) : FileText;

  return (
    <>
      <Card className={cn("overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-card h-full flex flex-col rounded-[2.5rem] shadow-sm", note.isPinned && "ring-2 ring-primary ring-offset-4 ring-offset-background")}>
        <div className={cn("relative aspect-[16/10] sm:aspect-video flex items-center justify-center cursor-pointer overflow-hidden", note.colorBanner || 'bg-blue-600')} onClick={handleOpen}>
          {note.bannerType === 'image' && note.thumbnail ? (
            <img src={note.thumbnail} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
          ) : note.bannerType === 'icon' ? (
            <BannerIcon className="h-14 sm:h-16 w-14 sm:w-16 text-white drop-shadow-xl group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 bg-white/10 opacity-20" />
          )}
          
          <div className="absolute top-4 left-4 flex gap-2">
            {note.isPinned && <div className="glass-card p-2 rounded-xl text-blue-500 shadow-sm"><Pin className="h-3 w-3 fill-current" /></div>}
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-bold flex items-center gap-1.5 border border-white/10"><Eye className="h-3 w-3" /> {note.viewCount || 0}</div>
          </div>

          <button onClick={toggleFavorite} className={cn("absolute top-4 right-4 z-20 p-2.5 rounded-xl backdrop-blur-md transition-all active:scale-90", isFavorite ? "bg-amber-500 text-white shadow-lg" : "bg-black/40 text-white hover:bg-black/60")}>
            <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
          
          {note.isPremium && !isUnlocked && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
              <Lock className="h-8 w-8 text-amber-500" />
              <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10">Elite Only</Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="p-5 sm:p-6 pb-2">
          <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">{note.chapter || 'Section'}</p>
          <h3 className="font-headline font-bold text-lg sm:text-xl line-clamp-2 mt-1 leading-snug">{note.title}</h3>
        </CardHeader>
        
        <CardContent className="px-5 sm:px-6 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed opacity-80">{note.description}</p>
        </CardContent>
        
        <CardFooter className="p-5 sm:p-6 pt-2 flex flex-col gap-3">
          <div className="flex gap-2 sm:gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-2xl h-11 sm:h-12 font-bold text-xs sm:text-sm border-2" onClick={handleOpen}>
              <Eye className="h-4 w-4 mr-2" /> View
            </Button>
            <Button className="flex-1 rounded-2xl h-11 sm:h-12 font-bold text-xs sm:text-sm shadow-md" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Save
            </Button>
          </div>
          {isAdmin && (
            <div className="flex gap-2 pt-4 border-t w-full">
              <Button variant="ghost" className="flex-1 h-10 text-destructive font-bold text-xs hover:bg-destructive/5" onClick={() => onDelete?.(note.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete Resource
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className={cn("p-0 border-none overflow-hidden transition-all duration-300", isFullScreen ? "max-w-none w-screen h-screen rounded-none" : "max-w-5xl w-[95vw] h-[85vh] rounded-[2.5rem] shadow-2xl")}>
          {showViewer && (
            <div className="flex flex-col h-full bg-slate-950">
              <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-xl"><FileText className="h-4 w-4 text-primary" /></div>
                  <div className="max-w-[150px] sm:max-w-md">
                    <h4 className="font-bold text-xs sm:text-sm truncate">{note.title}</h4>
                    <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">{note.chapter}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                    <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.max(50, prev - 10))} className="h-8 w-8 text-white hover:bg-white/10 rounded-lg"><ZoomOut className="h-3 w-3" /></Button>
                    <span className="text-[10px] font-bold w-10 text-center">{zoom}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.min(200, prev + 10))} className="h-8 w-8 text-white hover:bg-white/10 rounded-lg"><ZoomIn className="h-3 w-3" /></Button>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-white/10 mx-1" />
                  <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)} className="h-9 w-9 text-white hover:bg-white/10 rounded-xl transition-all active:scale-90">
                    {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowViewer(false)} className="h-9 w-9 text-white hover:bg-white/10 rounded-xl ml-1 active:scale-90">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 relative overflow-auto bg-slate-950 flex items-start justify-center p-4 sm:p-10 no-scrollbar">
                {viewerError ? (
                  <div className="flex flex-col items-center justify-center text-white space-y-6 pt-20 animate-in fade-in">
                    <div className="bg-rose-500/10 p-6 rounded-[2rem] border border-rose-500/20"><AlertCircle className="h-16 w-16 text-rose-500" /></div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">Failed to load resource</h3>
                      <p className="text-sm opacity-60 max-w-xs mx-auto leading-relaxed">The file might be private, deleted, or your connection is unstable.</p>
                    </div>
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-2xl h-12 px-8 font-bold" onClick={() => {setViewerError(false); setZoom(100);}}>Retry Access</Button>
                  </div>
                ) : (
                  <div 
                    className="w-full h-full flex items-start justify-center transition-transform duration-300 origin-top"
                    style={{ transform: `scale(${zoom / 100})` }}
                  >
                    {note.fileType === 'pdf' ? (
                      <iframe 
                        src={getEmbedUrl(note.fileUrl)} 
                        className="w-full h-full min-h-[600px] bg-white rounded-2xl shadow-2xl border-none" 
                        onError={() => setViewerError(true)}
                      />
                    ) : (
                      <img 
                        src={note.fileUrl} 
                        className="max-w-full h-auto rounded-2xl shadow-2xl" 
                        alt={note.title}
                        onError={() => setViewerError(true)}
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-6 bg-slate-900 border-t border-white/10 flex justify-center gap-4">
                <Button onClick={handleDownload} className="gap-3 rounded-2xl font-bold h-12 px-10 shadow-xl active:scale-95 transition-all"><Download className="h-4 w-4" /> Save Material</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPremiumPrompt} onOpenChange={setShowPremiumPrompt}>
        <DialogContent className="rounded-[2.5rem] p-8 sm:p-12 max-w-sm text-center border-none shadow-2xl bg-card">
          <DialogHeader>
            <div className="bg-amber-100 dark:bg-amber-900/30 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-amber-600 dark:text-amber-400 animate-bounce-slow">
              <Crown className="h-12 w-12" />
            </div>
            <DialogTitle className="text-3xl font-bold">Elite Resource</DialogTitle>
            <DialogDescription className="text-lg mt-4 opacity-80 leading-relaxed">
              This study material is reserved for Elite members. Unlock all content with a premium passcode.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-10 space-y-4">
            <Button className="w-full h-16 rounded-[1.5rem] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 text-xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all" onClick={() => {setShowPremiumPrompt(false); router.push('/premium');}}>
              Get Elite Access
            </Button>
            <Button variant="ghost" className="w-full h-14 rounded-[1.5rem] font-bold opacity-60" onClick={() => setShowPremiumPrompt(false)}>Maybe Later</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}