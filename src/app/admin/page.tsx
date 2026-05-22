
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ClassVaultHeader } from '@/components/ClassVaultHeader';
import { useRole, useFirestore, useCollection, useStorage } from '@/firebase';
import { doc, setDoc, deleteDoc, collection, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Trash2, FileText, Bell, ShieldCheck, ArrowLeft, Loader2, Upload, 
  Book, GraduationCap, Calculator, Laptop, Globe, Rocket, Pencil, Lightbulb, Atom, Variable, Code, 
  Sparkles, School, Trophy, Target, Brain, Orbit, TestTube, FlaskConical,
  Database, Crown, Pin, Settings, Save, TrendingUp, Download, Eye, Calendar, Layout, LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BANNER_COLORS = [
  { name: 'Blue', class: 'bg-blue-600' },
  { name: 'Sky', class: 'bg-sky-500' },
  { name: 'Navy', class: 'bg-slate-900' },
  { name: 'Purple', class: 'bg-purple-600' },
  { name: 'Violet', class: 'bg-violet-500' },
  { name: 'Pink', class: 'bg-pink-500' },
  { name: 'Red', class: 'bg-rose-600' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Yellow', class: 'bg-yellow-400' },
  { name: 'Gold', class: 'bg-amber-500' },
  { name: 'Green', class: 'bg-emerald-600' },
  { name: 'Lime', class: 'bg-lime-500' },
  { name: 'Teal', class: 'bg-teal-500' },
  { name: 'Cyan', class: 'bg-cyan-500' },
  { name: 'Gray', class: 'bg-slate-500' },
  { name: 'Dark Gray', class: 'bg-slate-700' },
  { name: 'Black', class: 'bg-black' },
  { name: 'Brown', class: 'bg-amber-900' },
  { name: 'Deep Blue Gradient', class: 'bg-gradient-to-br from-blue-700 to-indigo-900' },
  { name: 'Sunset Gradient', class: 'bg-gradient-to-br from-orange-400 to-rose-600' },
  { name: 'Nature Gradient', class: 'bg-gradient-to-br from-emerald-400 to-teal-700' },
  { name: 'Purple Dream', class: 'bg-gradient-to-br from-violet-600 to-purple-900' },
  { name: 'Cyber Gradient', class: 'bg-gradient-to-br from-cyan-400 to-blue-600' },
];

const EDUCATIONAL_ICONS = [
  { name: 'Book', icon: Book },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'FlaskConical', icon: FlaskConical },
  { name: 'Calculator', icon: Calculator },
  { name: 'Laptop', icon: Laptop },
  { name: 'Globe', icon: Globe },
  { name: 'Rocket', icon: Rocket },
  { name: 'Pencil', icon: Pencil },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Atom', icon: Atom },
  { name: 'Variable', icon: Variable },
  { name: 'Code', icon: Code },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'School', icon: School },
  { name: 'FileText', icon: FileText },
  { name: 'Trophy', icon: Trophy },
  { name: 'Target', icon: Target },
  { name: 'Brain', icon: Brain },
  { name: 'Orbit', icon: Orbit },
  { name: 'TestTube', icon: TestTube },
];

export default function AdminDashboard() {
  const { role, setRole, isLoadingRole, appCodes, refreshAppCodes } = useRole();
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const router = useRouter();

  const isAdmin = role === 'admin';
  const notesQuery = useMemo(() => (db && isAdmin) ? collection(db, 'notes') : null, [db, isAdmin]);
  const subjectsQuery = useMemo(() => (db && isAdmin) ? collection(db, 'subjects') : null, [db, isAdmin]);
  const announcementsQuery = useMemo(() => (db && isAdmin) ? collection(db, 'announcements') : null, [db, isAdmin]);

  const { data: notes, loading: notesLoading } = useCollection(notesQuery);
  const { data: subjects, loading: subjectsLoading } = useCollection(subjectsQuery);
  const { data: announcements, loading: announcementsLoading } = useCollection(announcementsQuery);

  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const totalViews = useMemo(() => notes?.reduce((acc, n) => acc + (n.viewCount || 0), 0) || 0, [notes]);
  const totalDownloads = useMemo(() => notes?.reduce((acc, n) => acc + (n.downloadCount || 0), 0) || 0, [notes]);
  const mostPopularNote = useMemo(() => [...(notes || [])].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))[0], [notes]);

  const [homeConfig, setHomeConfig] = useState({
    welcomeText: 'Master Your Subjects with Precision Notes',
    homeDescription: 'Access the full library of professional study materials.',
    featuredMessage: 'Revolutionizing Academic Excellence',
    visibleSections: ['hero', 'updates', 'pulse', 'subjects', 'latest']
  });

  const [premiumConfig, setPremiumConfig] = useState({
    premiumTitle: 'Elite Learning Starts Here',
    premiumSubtitle: 'Unlock the full elite library of exam boosters and premium academic guides.',
    premiumDescription: 'Unlock exclusive exam blueprints, high-yield summary sheets, and premium practice material curated for academic toppers.'
  });

  const [codesForm, setCodesForm] = useState({ adminCode: '234567', premiumCode: '345678' });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [isEditingNote, setIsEditingNote] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '', subjectId: '', chapter: '', description: '', fileUrl: '', fileType: 'pdf', thumbnail: '', isPremium: false, isPinned: false, colorBanner: 'bg-blue-600', iconName: 'FileText', bannerType: 'color' as 'color' | 'icon' | 'image'
  });
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingSubject, setIsEditingSubject] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({ 
    name: '', iconName: 'Book', description: '', colorBanner: 'bg-blue-600', thumbnail: '', bannerType: 'color' as 'color' | 'icon' | 'image' 
  });

  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', isPinned: false, publishDate: '' });

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; coll: string; id: string; title: string }>({
    open: false, coll: '', id: '', title: ''
  });

  useEffect(() => {
    if (db && isAdmin) {
      getDoc(doc(db, 'settings', 'homeConfig')).then((snap) => {
        if (snap.exists()) setHomeConfig(prev => ({ ...prev, ...snap.data() }));
      });
      getDoc(doc(db, 'settings', 'premiumConfig')).then((snap) => {
        if (snap.exists()) setPremiumConfig(prev => ({ ...prev, ...snap.data() }));
      });
      getDoc(doc(db, 'settings', 'accessControl')).then((snap) => {
        if (snap.exists()) setCodesForm(snap.data() as any);
      });
    }
  }, [db, isAdmin]);

  if (isLoadingRole) return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-screen gap-6 animate-in fade-in">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
        <ShieldCheck className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Authenticating Admin Access...</p>
    </div>
  );

  const handleVerify = () => {
    if (!appCodes) {
      toast({ variant: "destructive", title: "Security Error", description: "Could not fetch security codes. Please check your connection." });
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      if (passcode === appCodes.adminCode) {
        setRole('admin');
        toast({ title: "Session Verified", description: "Welcome back to the Control Center." });
      } else {
        toast({ variant: "destructive", title: "Access Denied", description: "The admin security code is incorrect." });
      }
      setIsVerifying(false);
    }, 600);
  };

  const handleLogout = () => {
    setRole(null);
    router.push('/');
    toast({ title: "Session Terminated", description: "You have been logged out of the vault." });
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card animate-in fade-in zoom-in duration-500">
          <div className="bg-primary p-12 text-center text-primary-foreground space-y-4">
            <div className="bg-white/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-2 shadow-2xl">
              <ShieldCheck className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold tracking-tight leading-none">Admin Portal</CardTitle>
            <p className="opacity-70 text-sm font-medium">Identity verification required</p>
          </div>
          <CardContent className="p-10 sm:p-12 space-y-8">
            <div className="space-y-4 text-center">
              <Label htmlFor="passcode" className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Security Code</Label>
              <Input 
                id="passcode" 
                type="password" 
                maxLength={6} 
                className="text-center text-4xl h-20 tracking-[1em] font-mono rounded-[1.5rem] border-2 focus:ring-primary focus:border-primary shadow-inner bg-muted/30" 
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="••••••"
              />
            </div>
            <Button className="w-full h-16 rounded-[1.5rem] text-xl font-bold shadow-xl active:scale-95 transition-all" onClick={handleVerify} disabled={isVerifying || passcode.length < 6}>
              {isVerifying ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify Access"}
            </Button>
            <Button variant="ghost" className="w-full gap-3 rounded-xl text-muted-foreground font-bold" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4" /> Return to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveConfig = () => {
    if (!db) return;
    
    if (codesForm.adminCode.length < 6 || codesForm.premiumCode.length < 6) {
      toast({ variant: "destructive", title: "Validation Error", description: "Security codes must be at least 6 digits long." });
      return;
    }

    setIsSavingConfig(true);
    const homePromise = setDoc(doc(db, 'settings', 'homeConfig'), homeConfig);
    const premiumPromise = setDoc(doc(db, 'settings', 'premiumConfig'), premiumConfig);
    const codesPromise = setDoc(doc(db, 'settings', 'accessControl'), {
      ...codesForm,
      updatedAt: serverTimestamp()
    });

    Promise.all([homePromise, premiumPromise, codesPromise])
      .then(() => {
        toast({ title: "Vault Configuration Saved" });
        refreshAppCodes();
      })
      .finally(() => setIsSavingConfig(false));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({ variant: "destructive", title: "Format Restricted", description: "Only PDF and JPG/PNG files are supported." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const storageRef = ref(storage, `notes/${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        setIsUploading(false);
        setUploadProgress(null);
        toast({ variant: "destructive", title: "Upload Failed", description: error.message });
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setNoteForm(prev => ({ ...prev, fileUrl: downloadURL, fileType: file.type.includes('pdf') ? 'pdf' : 'image' }));
          setUploadProgress(null);
          setIsUploading(false);
          toast({ title: "Material Synced Successfully" });
        });
      }
    );
  };

  const handleSaveNote = () => {
    if (!db) return;
    
    if (!noteForm.title || !noteForm.subjectId || !noteForm.fileUrl) {
      toast({ variant: "destructive", title: "Required Fields", description: "Title, Subject, and Link/File are mandatory." });
      return;
    }

    const noteId = isEditingNote || doc(collection(db, 'notes')).id;
    const data = {
      ...noteForm,
      viewCount: (notes?.find(n => n.id === noteId) as any)?.viewCount || 0,
      downloadCount: (notes?.find(n => n.id === noteId) as any)?.downloadCount || 0,
      uploadDate: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    setDoc(doc(db, 'notes', noteId), data, { merge: true })
      .then(() => {
        setIsEditingNote(null);
        setNoteForm({ title: '', subjectId: '', chapter: '', description: '', fileUrl: '', fileType: 'pdf', thumbnail: '', isPremium: false, isPinned: false, colorBanner: 'bg-blue-600', iconName: 'FileText', bannerType: 'color' });
        toast({ title: "Resource Published" });
      });
  };

  const handleSaveSubject = () => {
    if (!db || !subjectForm.name) return;
    
    const isDuplicate = subjects?.some(s => s.name.toLowerCase() === subjectForm.name.toLowerCase() && s.id !== isEditingSubject);
    if (isDuplicate) {
      toast({ variant: "destructive", title: "Duplicate Subject", description: "This category name is already in use." });
      return;
    }

    const subjectId = isEditingSubject || doc(collection(db, 'subjects')).id;
    const data = { ...subjectForm, createdAt: serverTimestamp() };

    setDoc(doc(db, 'subjects', subjectId), data, { merge: true })
      .then(() => {
        setIsEditingSubject(null);
        setSubjectForm({ name: '', iconName: 'Book', description: '', colorBanner: 'bg-blue-600', thumbnail: '', bannerType: 'color' });
        toast({ title: "Category Updated" });
      });
  };

  const handleSaveAnnouncement = () => {
    if (!db || !announcementForm.title) return;
    const annId = isEditingAnnouncement || doc(collection(db, 'announcements')).id;
    
    const data = { 
      ...announcementForm, 
      publishDate: announcementForm.publishDate ? Timestamp.fromDate(new Date(announcementForm.publishDate)) : serverTimestamp(),
      createdAt: serverTimestamp() 
    };

    setDoc(doc(db, 'announcements', annId), data, { merge: true })
      .then(() => {
        setIsEditingAnnouncement(null);
        setAnnouncementForm({ title: '', message: '', isPinned: false, publishDate: '' });
        toast({ title: "Broadcast Dispatched" });
      });
  };

  const handleDeleteConfirmed = () => {
    if (!db || !deleteConfirm.id) return;
    deleteDoc(doc(db, deleteConfirm.coll, deleteConfirm.id))
      .then(() => {
        toast({ title: "Data Wiped" });
        setDeleteConfirm({ open: false, coll: '', id: '', title: '' });
      });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <ClassVaultHeader />
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-16 max-w-7xl">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-headline font-bold text-foreground leading-tight tracking-tight">Control Center</h1>
            <p className="text-muted-foreground text-lg sm:text-xl opacity-70">Manage elite content, system broadcasts and security.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-card p-5 sm:p-6 rounded-[2rem] shadow-sm border border-primary/5 flex items-center gap-5">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary"><Database className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vault Sync</p>
                <p className="font-bold text-lg">Connected</p>
              </div>
            </div>
            <Button variant="outline" className="h-auto px-8 rounded-[2rem] border-rose-200 text-rose-600 font-bold gap-3 hover:bg-rose-50" onClick={handleLogout}>
              <LogOut className="h-5 w-5" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-16 sm:mb-24">
          <Card className="border-none shadow-sm rounded-[2.5rem] p-6 sm:p-10 bg-card flex flex-col items-center justify-center space-y-4 hover:shadow-xl transition-all duration-500">
            <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500"><Eye className="h-8 w-8" /></div>
            <div className="text-center">
              <p className="text-3xl sm:text-5xl font-bold tracking-tight">{totalViews}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">Engagement</p>
            </div>
          </Card>
          <Card className="border-none shadow-sm rounded-[2.5rem] p-6 sm:p-10 bg-card flex flex-col items-center justify-center space-y-4 hover:shadow-xl transition-all duration-500">
            <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500"><Download className="h-8 w-8" /></div>
            <div className="text-center">
              <p className="text-3xl sm:text-5xl font-bold tracking-tight">{totalDownloads}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">Deliveries</p>
            </div>
          </Card>
          <Card className="border-none shadow-sm rounded-[2.5rem] p-6 sm:p-10 bg-card flex flex-col items-center justify-center space-y-4 hover:shadow-xl transition-all duration-500">
            <div className="bg-amber-500/10 p-4 rounded-2xl text-amber-500"><TrendingUp className="h-8 w-8" /></div>
            <div className="text-center w-full">
              <p className="text-lg sm:text-xl font-bold line-clamp-1 opacity-80">{mostPopularNote?.title || 'None'}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">Hottest</p>
            </div>
          </Card>
          <Card className="border-none shadow-sm rounded-[2.5rem] p-6 sm:p-10 bg-card flex flex-col items-center justify-center space-y-4 hover:shadow-xl transition-all duration-500">
            <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-500"><Crown className="h-8 w-8" /></div>
            <div className="text-center">
              <p className="text-3xl sm:text-5xl font-bold tracking-tight">{notes?.filter(n => n.isPremium).length || 0}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">Elite Files</p>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="notes" className="space-y-12">
          <TabsList className="bg-card border p-1.5 rounded-[2rem] h-auto shadow-sm w-full lg:w-fit overflow-x-auto no-scrollbar flex justify-start lg:justify-center">
            <TabsTrigger value="notes" className="gap-2 rounded-2xl h-14 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shrink-0">Resources</TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2 rounded-2xl h-14 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shrink-0">Directory</TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2 rounded-2xl h-14 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shrink-0">Broadcasting</TabsTrigger>
            <TabsTrigger value="config" className="gap-3 rounded-2xl h-14 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shrink-0"><Settings className="h-4 w-4" /> Vault Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-card">
              <CardHeader className="p-8 sm:p-12 border-b bg-muted/20">
                <CardTitle className="text-3xl font-bold tracking-tight">{isEditingNote ? 'Modify Resource' : 'Publish Elite Resource'}</CardTitle>
                <CardDescription className="text-base sm:text-lg mt-2 opacity-70 leading-relaxed">Assign materials to subjects and configure security settings. Featured notes appear at the top.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 sm:p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest ml-1">Document Title</Label>
                    <Input value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="e.g. Advanced Quantum Logic" className="rounded-2xl h-14 text-base sm:text-lg border-2 shadow-inner bg-muted/20" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest ml-1">Subject Association</Label>
                    <Select value={noteForm.subjectId} onValueChange={v => setNoteForm({...noteForm, subjectId: v})}>
                      <SelectTrigger className="rounded-2xl h-14 text-base sm:text-lg border-2 shadow-inner bg-muted/20"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl">{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="font-bold text-xs uppercase tracking-widest ml-1">Visual Branding</Label>
                  <div className="space-y-6 bg-muted/20 p-6 sm:p-10 rounded-[2.5rem] border border-primary/5">
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                      {BANNER_COLORS.map(c => (
                        <button key={c.name} onClick={() => setNoteForm({...noteForm, colorBanner: c.class, bannerType: 'color'})} className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-4 transition-all shadow-md active:scale-90", c.class, noteForm.colorBanner === c.class ? "border-primary" : "border-background")} />
                      ))}
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                      {EDUCATIONAL_ICONS.map(i => {
                        const Icon = i.icon;
                        return (
                          <button key={i.name} onClick={() => setNoteForm({...noteForm, iconName: i.name, bannerType: 'icon'})} className={cn("h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl border-4 transition-all shadow-md active:scale-90", noteForm.iconName === i.name ? "border-primary bg-primary text-white" : "border-background bg-card text-muted-foreground")}><Icon className="h-6 w-6" /></button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20">
                  <div className="space-y-6">
                    <Label className="font-bold text-xs uppercase tracking-widest ml-1">Source Attachment</Label>
                    <div className="space-y-6 p-8 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-primary/20">
                      <Button variant="outline" className="w-full rounded-2xl h-16 gap-3 text-lg font-bold border-2 bg-card hover:bg-muted/50 transition-all shadow-md active:scale-95" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                        {isUploading ? 'Syncing...' : 'Select Material File'}
                      </Button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
                      {uploadProgress !== null && <Progress value={uploadProgress} className="h-2" />}
                      <div className="space-y-3">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold ml-1 text-center block">Or Link External Storage</Label>
                        <Input value={noteForm.fileUrl} onChange={e => setNoteForm({...noteForm, fileUrl: e.target.value})} placeholder="Paste direct URL here" className="rounded-2xl h-14 text-base border-2 shadow-inner bg-card" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <Label className="font-bold text-xs uppercase tracking-widest ml-1">Material Metadata</Label>
                    <div className="space-y-6">
                      <Input value={noteForm.chapter} onChange={e => setNoteForm({...noteForm, chapter: e.target.value})} placeholder="Unit / Chapter Reference" className="rounded-2xl h-14 text-base border-2 shadow-inner bg-muted/20" />
                      <Textarea value={noteForm.description} onChange={e => setNoteForm({...noteForm, description: e.target.value})} placeholder="Abstract / Summary of contents..." className="rounded-2xl h-32 text-base border-2 shadow-inner bg-muted/20 p-5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-primary/5 p-8 sm:p-10 rounded-[2.5rem] border border-primary/10">
                  <div className="flex items-center space-x-5 group cursor-pointer">
                    <Checkbox id="isPremiumNote" checked={noteForm.isPremium} onCheckedChange={checked => setNoteForm({...noteForm, isPremium: !!checked})} className="h-6 w-6 rounded-lg transition-all" />
                    <Label htmlFor="isPremiumNote" className="font-bold text-lg text-amber-600 dark:text-amber-400 flex items-center gap-3 cursor-pointer"><Crown className="h-6 w-6" /> Elite Membership Only</Label>
                  </div>
                  <div className="flex items-center space-x-5 group cursor-pointer">
                    <Checkbox id="isPinnedNote" checked={noteForm.isPinned} onCheckedChange={checked => setNoteForm({...noteForm, isPinned: !!checked})} className="h-6 w-6 rounded-lg transition-all" />
                    <Label htmlFor="isPinnedNote" className="font-bold text-lg text-primary flex items-center gap-3 cursor-pointer"><Pin className="h-6 w-6" /> Feature on Dashboard</Label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <Button onClick={handleSaveNote} className="rounded-[1.5rem] h-16 sm:h-20 px-12 text-xl sm:text-2xl font-bold flex-1 shadow-2xl shadow-primary/20 active:scale-95 transition-all" disabled={isUploading}>
                    {isEditingNote ? 'Update Resource' : 'Publish Resource'}
                  </Button>
                  {isEditingNote && <Button variant="ghost" onClick={() => setIsEditingNote(null)} className="h-16 sm:h-20 px-8 rounded-[1.5rem] font-bold text-lg">Cancel Edit</Button>}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
              {!notesLoading && notes?.length === 0 && (
                <div className="col-span-full py-32 text-center text-muted-foreground italic border-2 border-dashed rounded-[4rem] bg-muted/10 opacity-50">
                  No materials published in the vault yet.
                </div>
              )}
              {notes?.map(note => (
                <div key={note.id} className="bg-card rounded-[2.5rem] overflow-hidden border shadow-sm group relative hover:shadow-2xl transition-all duration-500">
                  <div className={cn("aspect-video flex items-center justify-center relative", note.colorBanner)}>
                    {note.bannerType === 'icon' && (() => {
                      const Icon = EDUCATIONAL_ICONS.find(i => i.name === note.iconName)?.icon || FileText;
                      return <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />;
                    })()}
                    {note.isPinned && <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 p-2 rounded-xl text-blue-500 shadow-sm"><Pin className="h-3 w-3 fill-current" /></div>}
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-500 backdrop-blur-[2px]">
                      <Button size="sm" className="rounded-xl font-bold px-6 h-10 active:scale-90 transition-all" onClick={() => { setIsEditingNote(note.id); setNoteForm(note as any); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</Button>
                      <Button size="sm" variant="destructive" className="rounded-xl font-bold px-6 h-10 active:scale-90 transition-all" onClick={() => setDeleteConfirm({ open: true, coll: 'notes', id: note.id, title: note.title })}>Delete</Button>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 space-y-3">
                    <p className="font-bold text-lg line-clamp-1 leading-tight">{note.title}</p>
                    <div className="flex items-center gap-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                      <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {note.viewCount || 0}</span>
                      <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> {note.downloadCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
              <div className="space-y-12">
                <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-card">
                  <CardHeader className="p-8 sm:p-12 bg-muted/20 border-b">
                    <div className="flex items-center gap-4">
                      <Layout className="h-8 w-8 text-primary" />
                      <CardTitle className="text-3xl font-bold tracking-tight">Home Tab Content</CardTitle>
                    </div>
                    <p className="text-muted-foreground font-medium mt-1">Manage titles and messages on the Home tab.</p>
                  </CardHeader>
                  <CardContent className="p-8 sm:p-12 space-y-8">
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest ml-1">Welcome Headline</Label>
                      <Input value={homeConfig.welcomeText} onChange={e => setHomeConfig({...homeConfig, welcomeText: e.target.value})} className="rounded-2xl h-14 text-base border-2 shadow-inner bg-muted/20" />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest ml-1">Hero Sub-Headline</Label>
                      <Textarea value={homeConfig.homeDescription} onChange={e => setHomeConfig({...homeConfig, homeDescription: e.target.value})} className="rounded-2xl h-24 text-base border-2 shadow-inner bg-muted/20" />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest ml-1">Featured Tagline</Label>
                      <Input value={homeConfig.featuredMessage} onChange={e => setHomeConfig({...homeConfig, featuredMessage: e.target.value})} className="rounded-2xl h-14 text-base border-2 shadow-inner bg-muted/20" />
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                      <Label className="font-bold text-xs uppercase tracking-widest ml-1 text-primary">Active Modules</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['hero', 'updates', 'pulse', 'subjects', 'latest'].map(section => (
                          <div key={section} className="flex items-center justify-between bg-muted/30 p-5 rounded-[1.5rem] border border-primary/5">
                            <span className="font-bold capitalize text-sm">{section}</span>
                            <Switch 
                              checked={homeConfig.visibleSections.includes(section)} 
                              onCheckedChange={(checked) => {
                                const newSections = checked 
                                  ? [...homeConfig.visibleSections, section]
                                  : homeConfig.visibleSections.filter(s => s !== section);
                                setHomeConfig({...homeConfig, visibleSections: newSections});
                              }} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-card">
                  <CardHeader className="p-8 sm:p-12 bg-muted/20 border-b">
                    <div className="flex items-center gap-4">
                      <Crown className="h-8 w-8 text-amber-500" />
                      <CardTitle className="text-3xl font-bold tracking-tight">Premium Tab Content</CardTitle>
                    </div>
                    <p className="text-muted-foreground font-medium mt-1">Manage titles and benefit descriptions for Elite students.</p>
                  </CardHeader>
                  <CardContent className="p-8 sm:p-12 space-y-8">
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest ml-1">Elite Heading</Label>
                      <Input value={premiumConfig.premiumTitle} onChange={e => setPremiumConfig({...premiumConfig, premiumTitle: e.target.value})} className="rounded-2xl h-14 text-base border-2 shadow-inner bg-muted/20" />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest ml-1">Elite Sub-Heading</Label>
                      <Input value={premiumConfig.premiumSubtitle} onChange={e => setPremiumConfig({...premiumConfig, premiumSubtitle: e.target.value})} className="rounded-2xl h-14 text-base border-2 shadow-inner bg-muted/20" />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest ml-1">Benefit Description</Label>
                      <Textarea value={premiumConfig.premiumDescription} onChange={e => setPremiumConfig({...premiumConfig, premiumDescription: e.target.value})} className="rounded-2xl h-32 text-base border-2 shadow-inner bg-muted/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-card h-fit lg:sticky lg:top-24">
                <CardHeader className="p-8 sm:p-12 bg-muted/20 border-b">
                  <CardTitle className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">Vault Security</CardTitle>
                  <CardDescription className="text-base sm:text-lg mt-1 font-medium">Manage access codes for elite features.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-10">
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest ml-1">Admin Security Passcode</Label>
                    <Input value={codesForm.adminCode} onChange={e => setCodesForm({...codesForm, adminCode: e.target.value})} className="rounded-2xl h-14 font-mono text-3xl sm:text-4xl text-center border-2 shadow-inner bg-muted/20 tracking-[0.4em]" maxLength={6} />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest ml-1">Elite Invitation Code</Label>
                    <Input value={codesForm.premiumCode} onChange={e => setCodesForm({...codesForm, premiumCode: e.target.value})} className="rounded-2xl h-14 font-mono text-3xl sm:text-4xl text-center border-2 shadow-inner bg-muted/20 tracking-[0.4em]" maxLength={6} />
                  </div>
                  <div className="p-8 bg-amber-500/10 rounded-[2rem] border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-3">
                    <p className="font-bold flex items-center gap-3 text-lg"><ShieldCheck className="h-6 w-6" /> Security Best Practice</p>
                    <p className="text-sm leading-relaxed opacity-80">Rotating these codes monthly is recommended. Updates take effect immediately for all new sessions.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Button onClick={handleSaveConfig} className="rounded-[2rem] h-20 px-12 text-2xl font-bold w-full shadow-2xl shadow-primary/20 active:scale-95 transition-all" disabled={isSavingConfig}>
              {isSavingConfig ? <Loader2 className="h-8 w-8 animate-spin mr-3" /> : <Save className="h-8 w-8 mr-3" />}
              Synchronize Vault Configuration
            </Button>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-12 animate-in fade-in duration-700">
            <Card className="border-none shadow-xl rounded-[3.5rem] overflow-hidden bg-card max-w-4xl mx-auto">
              <CardHeader className="p-8 sm:p-12 bg-muted/20 border-b">
                <CardTitle className="text-3xl font-bold tracking-tight">{isEditingSubject ? 'Modify Category' : 'Create New Library Category'}</CardTitle>
                <p className="text-muted-foreground font-medium mt-1">Define subjects for content organization.</p>
              </CardHeader>
              <CardContent className="p-8 sm:p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest ml-1">Subject Name</Label>
                    <Input value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} className="rounded-2xl h-14 text-lg border-2 shadow-inner bg-muted/20" placeholder="e.g. Theoretical Physics" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest ml-1">Brief Description</Label>
                    <Input value={subjectForm.description} onChange={e => setSubjectForm({...subjectForm, description: e.target.value})} className="rounded-2xl h-14 text-lg border-2 shadow-inner bg-muted/20" placeholder="e.g. Core principles of mechanics..." />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="font-bold text-xs uppercase tracking-widest ml-1 text-primary">Category Color Theme</Label>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 bg-muted/20 p-6 rounded-[2rem] border border-primary/5">
                    {BANNER_COLORS.map(c => (
                      <button key={c.name} onClick={() => setSubjectForm({...subjectForm, colorBanner: c.class, bannerType: 'color'})} className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-xl transition-all shadow-md active:scale-90", c.class, subjectForm.colorBanner === c.class && "ring-4 ring-primary ring-offset-4 ring-offset-background")} />
                    ))}
                  </div>
                </div>
                <Button onClick={handleSaveSubject} className="rounded-[1.5rem] h-16 sm:h-20 px-12 text-xl sm:text-2xl font-bold w-full shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                  {isEditingSubject ? 'Update Category' : 'Create Subject Category'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-12 animate-in fade-in duration-700">
             <Card className="border-none shadow-xl rounded-[3.5rem] overflow-hidden bg-card max-w-4xl mx-auto">
              <CardHeader className="p-8 sm:p-12 bg-muted/20 border-b">
                <CardTitle className="text-3xl font-bold tracking-tight">System Broadcasting</CardTitle>
                <CardDescription className="text-base sm:text-lg mt-1 font-medium leading-relaxed">Broadcast platform-wide updates and critical information to all students.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 sm:p-12 space-y-8">
                <div className="space-y-4">
                  <Label className="font-bold text-xs uppercase tracking-widest ml-1">Broadcast Title</Label>
                  <Input value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} placeholder="e.g. New Elite Biology Unit Available" className="rounded-2xl h-14 text-lg border-2 shadow-inner bg-muted/20" />
                </div>
                <div className="space-y-4">
                  <Label className="font-bold text-xs uppercase tracking-widest ml-1">Broadcast Message</Label>
                  <Textarea value={announcementForm.message} onChange={e => setAnnouncementForm({...announcementForm, message: e.target.value})} placeholder="Detailed information for students..." className="rounded-2xl h-40 text-lg border-2 shadow-inner bg-muted/20 p-6" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-between p-6 bg-muted/30 rounded-[1.5rem] border border-primary/5">
                    <div className="flex items-center gap-4">
                      <Switch checked={announcementForm.isPinned} onCheckedChange={v => setAnnouncementForm({...announcementForm, isPinned: v})} />
                      <Label className="font-bold text-base cursor-pointer">Priority Pin to Top</Label>
                    </div>
                    <Pin className={cn("h-5 w-5 transition-all", announcementForm.isPinned ? "text-amber-500 fill-amber-500" : "text-muted-foreground opacity-20")} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Scheduled Deployment (UTC)</Label>
                    <Input type="datetime-local" value={announcementForm.publishDate} onChange={e => setAnnouncementForm({...announcementForm, publishDate: e.target.value})} className="rounded-2xl h-14 text-base border-2 shadow-inner bg-muted/20" />
                  </div>
                </div>

                <Button onClick={handleSaveAnnouncement} className="rounded-[1.5rem] h-16 sm:h-20 px-12 text-xl sm:text-2xl font-bold w-full shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                  Broadcast to Vault
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-muted/10 py-16 sm:py-24 mt-20">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} ClassVault. Secure Admin Interface.</p>
        </div>
      </footer>

      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ ...deleteConfirm, open: false })}>
        <AlertDialogContent className="rounded-[3rem] border-none shadow-2xl p-10 sm:p-14 bg-card max-w-lg">
          <AlertDialogHeader className="text-center">
            <div className="bg-rose-500/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-rose-500 shadow-inner border border-rose-500/10">
              <Trash2 className="h-12 w-12" />
            </div>
            <AlertDialogTitle className="text-3xl font-headline font-bold leading-tight tracking-tight">Confirm Data Wipe?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg mt-6 opacity-70 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-foreground">"{deleteConfirm.title}"</span>? 
              {deleteConfirm.coll === 'subjects' && ' This category contains related notes that will become uncategorized.'} 
              This action is permanent and cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4 mt-12 sm:flex-row">
            <AlertDialogCancel className="rounded-2xl h-14 sm:h-16 font-bold flex-1 border-2 text-lg">Cancel Action</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} className="rounded-2xl h-14 sm:h-16 font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1 shadow-2xl shadow-destructive/20 text-lg">Wipe Permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
