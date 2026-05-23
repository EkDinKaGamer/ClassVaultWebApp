
'use client';

import { useState, useMemo } from 'react';
import { ClassVaultHeader } from '@/components/ClassVaultHeader';
import { NoteCard } from '@/components/NoteCard';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, ShieldCheck, Zap, DownloadCloud, FileQuestion, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useCollection, useRole, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function PremiumPage() {
  const { role, setRole, appCodes } = useRole();
  const db = useFirestore();
  const { toast } = useToast();
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Content configuration - Only run if role is set
  const configRef = useMemo(() => (db && role) ? doc(db, 'settings', 'premiumConfig') : null, [db, role]);
  const { data: config, loading: configLoading } = useDoc(configRef, { silent: true });

  const premiumConfig = useMemo(() => ({
    premiumTitle: config?.premiumTitle || 'Elite Learning Starts Here',
    premiumSubtitle: config?.premiumSubtitle || 'Unlock the full elite library of exam boosters and premium academic guides.',
    premiumDescription: config?.premiumDescription || 'Unlock exclusive exam blueprints, high-yield summary sheets, and premium practice material curated for academic toppers.'
  }), [config]);

  const premiumNotesQuery = useMemo(() => 
    (db && role) ? query(collection(db, 'notes'), where('isPremium', '==', true)) : null
  , [db, role]);

  const { data: notes } = useCollection(premiumNotesQuery, { silent: true });

  const isPremiumOrAdmin = role === 'premium-student' || role === 'admin';

  const handleUnlockPremium = () => {
    if (!appCodes) return;
    setIsVerifying(true);
    setTimeout(() => {
      if (passcode === appCodes.premiumCode) {
        setRole('premium-student');
        toast({
          title: "Elite Status Activated",
          description: "Welcome to ClassVault Elite. All exclusive resources are now unlocked.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Passcode",
          description: "Please enter the correct elite access code.",
        });
      }
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ClassVaultHeader />
      
      <main className="flex-1 pb-20">
        <section className="bg-slate-950 text-white py-20 sm:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-20" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="container mx-auto px-4 relative z-10 text-center space-y-10 px-6">
            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 px-6 py-2 text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase rounded-full">
              ClassVault Elite
            </Badge>
            {configLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full max-w-4xl mx-auto bg-white/10" />
                <Skeleton className="h-10 w-full max-w-2xl mx-auto bg-white/10" />
              </div>
            ) : (
              <>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-headline font-bold tracking-tight leading-[1.05]">
                  {premiumConfig.premiumTitle.split(' ').slice(0, -2).join(' ')} <br /><span className="text-amber-500">{premiumConfig.premiumTitle.split(' ').slice(-2).join(' ')}</span>
                </h1>
                <p className="text-lg sm:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed opacity-80">
                  {premiumConfig.premiumDescription}
                </p>
              </>
            )}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-6">
              <div className="flex items-center gap-3 text-slate-300 text-sm sm:text-base font-medium">
                <ShieldCheck className="h-6 w-6 text-amber-500" /> Secure Library
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm sm:text-base font-medium">
                <DownloadCloud className="h-6 w-6 text-amber-500" /> Priority Save
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm sm:text-base font-medium">
                <Zap className="h-6 w-6 text-amber-500" /> Instant Access
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 -mt-16 sm:-mt-24 relative z-20 space-y-24 sm:space-y-32">
          {!isPremiumOrAdmin ? (
            <Card className="max-w-3xl mx-auto shadow-2xl border-none rounded-[3rem] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000 bg-card">
               <div className="bg-amber-500 p-10 sm:p-16 text-center text-slate-950 space-y-6">
                <div className="bg-white/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl">
                  <Lock className="h-12 w-12" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-headline font-bold">Unlock Elite Access</h2>
                <p className="text-slate-950/70 text-base sm:text-lg max-w-sm mx-auto font-medium">
                  {premiumConfig.premiumSubtitle}
                </p>
              </div>
              <CardContent className="p-10 sm:p-16 space-y-12">
                <div className="space-y-6 text-center">
                  <Label htmlFor="premium-code" className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] block">Elite Access Passcode</Label>
                  <Input 
                    id="premium-code"
                    type="password"
                    maxLength={6}
                    className="text-center text-4xl sm:text-6xl h-24 sm:h-32 tracking-[0.8em] font-mono rounded-[2rem] border-2 border-muted focus:ring-amber-500 focus:border-amber-500 shadow-inner bg-muted/50"
                    placeholder="••••••"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full h-16 sm:h-20 rounded-[2rem] text-xl sm:text-2xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
                  onClick={handleUnlockPremium}
                  disabled={isVerifying || passcode.length < 6}
                >
                  {isVerifying ? <Loader2 className="h-7 w-7 animate-spin" /> : "Verify & Activate Elite"}
                </Button>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 text-sm">
                  <p className="text-muted-foreground font-medium">Need a passcode?</p>
                  <Button variant="link" className="text-amber-600 dark:text-amber-400 font-bold gap-2">Contact Administration <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <Card className="shadow-xl border-none rounded-[2.5rem] bg-card hover:translate-y-[-8px] transition-all duration-500">
                  <CardHeader className="text-center p-10">
                    <div className="bg-amber-50 dark:bg-amber-900/30 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Sparkles className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Exam Blueprints</CardTitle>
                    <CardDescription className="text-base mt-4 opacity-70 leading-relaxed">Consolidated high-yield blueprints designed for zero-gap revision.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="shadow-xl border-none rounded-[2.5rem] bg-card hover:translate-y-[-8px] transition-all duration-500">
                  <CardHeader className="text-center p-10">
                    <div className="bg-blue-50 dark:bg-blue-900/30 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <FileQuestion className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Master Banks</CardTitle>
                    <CardDescription className="text-base mt-4 opacity-70 leading-relaxed">Curated master question banks with 95% syllabus coverage.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="shadow-xl border-none rounded-[2.5rem] bg-card hover:translate-y-[-8px] transition-all duration-500">
                  <CardHeader className="text-center p-10">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Crown className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Expert Solutions</CardTitle>
                    <CardDescription className="text-base mt-4 opacity-70 leading-relaxed">Full-length practice papers with detailed topper-style logic.</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="space-y-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-primary/10 pb-10">
                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-5xl font-headline font-bold flex items-center gap-5">
                      <div className="bg-amber-500/10 p-2.5 rounded-2xl"><Crown className="h-8 w-8 text-amber-500" /></div>
                      Elite Resource Library
                    </h2>
                    <p className="text-muted-foreground text-lg opacity-70">Exclusive materials unlocked for your account.</p>
                  </div>
                  <Badge variant="outline" className="px-6 py-2 rounded-xl border-amber-500 text-amber-600 bg-amber-500/5 font-bold uppercase tracking-widest text-[10px]">Membership Active</Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 animate-in fade-in duration-700">
                  {notes?.map((note) => (
                    <NoteCard key={note.id} note={note as any} />
                  ))}
                  {notes && notes.length === 0 && (
                    <div className="col-span-full py-32 text-center text-muted-foreground border-2 border-dashed rounded-[3rem] bg-muted/10 italic opacity-40">
                      The Elite library is currently being updated with new materials.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Card className="bg-slate-950 text-white p-10 sm:p-20 text-center rounded-[4rem] border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full group-hover:bg-amber-500/20 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
            <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-6xl font-headline font-bold leading-tight tracking-tight">Ready for Academic Excellence?</h2>
              <p className="text-slate-400 text-lg sm:text-xl leading-relaxed opacity-80">
                Join thousands of top-tier students using ClassVault Elite to secure their future.
              </p>
              {!isPremiumOrAdmin && (
                <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-[1.5rem] h-16 sm:h-20 px-12 sm:px-16 text-xl sm:text-2xl shadow-2xl shadow-amber-500/30 transition-all active:scale-95">
                    Activate Elite Pass
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
