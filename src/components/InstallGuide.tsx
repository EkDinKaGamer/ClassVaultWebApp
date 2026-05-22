
'use client';

import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, MoreVertical, Smartphone, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

export function InstallGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other' | null>(null);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('cv_install_guide_dismissed');
    if (dismissed) return;

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('other');

    // Show after 5 seconds
    const timer = setTimeout(() => setIsVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('cv_install_guide_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 right-4 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <Card className="max-w-md mx-auto shadow-2xl border-none glass-card rounded-[2rem] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base">Install ClassVault</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add to Home Screen for the full elite experience and faster access.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="rounded-full h-8 w-8 -mt-2 -mr-2">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Instructions</p>
            {platform === 'ios' ? (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Share className="h-4 w-4 text-blue-500" />
                <span>Tap Share then <span className="text-primary font-bold">"Add to Home Screen"</span></span>
              </div>
            ) : platform === 'android' ? (
              <div className="flex items-center gap-3 text-sm font-medium">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                <span>Tap menu then <span className="text-primary font-bold">"Install app"</span></span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Download className="h-4 w-4 text-primary" />
                <span>Use your browser menu to install ClassVault.</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="flex-1 rounded-xl h-11 font-bold" onClick={handleDismiss}>Got it!</Button>
            <Button variant="ghost" className="rounded-xl h-11 font-bold text-muted-foreground" onClick={handleDismiss}>Not now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
