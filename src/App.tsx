import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MerchantDashboard } from './components/MerchantDashboard';
import { HowItWorks, Developers, Contact } from './components/InfoPages';
import { Toaster } from '@/components/ui/sonner';

type ViewState = 'hero' | 'dashboard' | 'how-it-works' | 'developers' | 'contact';

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-blue-liquid-ink-in-water-4322-large.mp4" type="video/mp4" />
      </video>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] font-normal animate-fade-rise">
          Accept USDC anywhere. <br />
          <em className="not-italic text-muted-foreground">Settle transparently.</em>
        </h1>
        
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          Customers scan, pay in USDC, and check out in seconds. Behind the scenes, 
          Circle routes native settlement while Avalanche records auditable merchant payouts. 
          No bridge UI, no chain IDs, no complexity—just a reliable onchain checkout terminal.
        </p>

        <Button 
          onClick={onStart}
          className="liquid-glass rounded-full px-14 py-8 text-lg text-foreground mt-12 hover:scale-[1.03] transition-transform animate-fade-rise-delay-2 h-auto"
        >
          Launch Terminal
        </Button>
      </div>
    </div>
  );
}

export function Navbar({ currentView, setView }: { currentView: ViewState, setView: (v: ViewState) => void }) {
  const navLinks: { label: string, view: ViewState }[] = [
    { label: 'Home', view: 'hero' },
    { label: 'For Merchants', view: 'dashboard' },
    { label: 'How It Works', view: 'how-it-works' },
    { label: 'Developers', view: 'developers' },
    { label: 'Contact', view: 'contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto liquid-glass rounded-full px-8 py-3 flex flex-row justify-between items-center border border-white/10">
        <div 
          className="text-2xl tracking-tighter font-display text-foreground cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => setView('hero')}
        >
          CRegi
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button 
              key={link.view}
              onClick={() => setView(link.view)} 
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-all hover:text-foreground", 
                currentView === link.view ? 'text-foreground font-bold' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        <Button 
          onClick={() => setView('dashboard')}
          variant="ghost" 
          className={cn(
            "rounded-full px-6 py-2 h-9 text-[10px] uppercase tracking-widest text-foreground hover:bg-white/10 transition-all border border-white/5", 
            currentView === 'dashboard' && "bg-white/10"
          )}
        >
          Launch
        </Button>
      </div>
    </nav>
  );
}

export default function App() {
  const [view, setView] = useState<ViewState>('hero');

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground pt-24">
      <Navbar currentView={view} setView={setView} />
      
      <main className="relative">
        {view === 'hero' && <Hero onStart={() => setView('dashboard')} />}
        {view === 'dashboard' && <MerchantDashboard />}
        {view === 'how-it-works' && <HowItWorks />}
        {view === 'developers' && <Developers />}
        {view === 'contact' && <Contact />}
      </main>
      
      <Toaster position="top-center" theme="dark" closeButton />
    </div>
  );
}
