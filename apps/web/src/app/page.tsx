"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Car, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Zap,
  ChevronRight,
  PieChart as ChartIcon,
  Search
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-white overflow-x-hidden selection:bg-brand-500/30 selection:text-brand-200">
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-bg-base/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="Antigravity Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold font-display tracking-tighter">Antigravity</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white px-4">Sign In</Link>
            <Link href="/register" className="btn-primary flex items-center gap-2">
              Start Free Trial <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-44 pb-32 px-6">
        {/* Abstract background glow */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-brand-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <Zap className="w-3 h-3 fill-brand-400" /> The Future of Fleet Management
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Defy Gravity with <br /> 
            <span className="text-gradient">Precision P&L.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            The all-in-one operating system for modern travel fleets. Track every kilometer, settle every trip, and maximize your net profit in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Link href="/register" className="btn-primary text-base px-10 py-4 rounded-2xl group shadow-glow-sm hover:shadow-glow-lg transition-all duration-300">
              Get Started for Free <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-bg-elevated/50 text-white font-medium rounded-2xl border border-white/5 hover:bg-bg-elevated transition-all backdrop-blur-xl">
              Watch Demo video
            </button>
          </div>

          {/* Simulated Dashboard Preview */}
          <div className="mt-24 relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="absolute inset-0 bg-brand-500/20 blur-[100px] rounded-3xl opacity-50" />
            <div className="relative card p-2 bg-white/[0.02] border-white/10 backdrop-blur-md rounded-[2.5rem] shadow-2xl">
              <div className="rounded-[2rem] overflow-hidden bg-bg-surface border border-white/5 aspect-[16/9] relative">
                {/* Mock UI layout */}
                <div className="absolute inset-0 grid grid-cols-[200px_1fr]">
                  <div className="border-r border-white/5 bg-bg-base/50 p-6 space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 bg-white/5 rounded-full w-full" />
                    ))}
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-6 bg-white/10 rounded-lg w-48" />
                        <div className="h-3 bg-white/5 rounded-full w-24" />
                      </div>
                      <div className="h-10 w-10 bg-brand-500/20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="h-28 card bg-white/[0.02]" />
                      <div className="h-28 card bg-white/[0.02]" />
                      <div className="h-28 card bg-white/[0.02]" />
                    </div>
                    <div className="h-48 card bg-white/[0.02] relative overflow-hidden">
                      {/* Abstract chart curve */}
                      <div className="absolute inset-0 opacity-20">
                         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                           <path d="M0,50 Q25,20 50,70 T100,30" fill="none" stroke="#6366f1" strokeWidth="2" />
                         </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Engineered for Excellence.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Stop guessing where your money goes. Get total transparency into your fleet's financial health.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ChartIcon} 
              title="Real-time P&L" 
              desc="Automatic synchronization of costs and revenue. See your net profit updated with every single trip entry." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Compliance Guard" 
              desc="Automatic tracking of permits, insurance, and PUC. Get notified before documents expire to stay operational." 
            />
            <FeatureCard 
              icon={Clock} 
              title="Instant Settlements" 
              desc="Streamline driver salaries and trip billing. Calculate accurate driver dues in seconds, not hours." 
            />
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto card p-12 md:p-20 relative overflow-hidden bg-gradient-to-br from-brand-600/20 to-transparent border-brand-500/20 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full" />
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-8">Ready to Scale Your Fleet?</h2>
          <p className="text-slate-400 mb-12 text-lg">Join 100+ travel operators who have increased their net margins by 18% with Antigravity.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/register" className="btn-primary px-10 py-4 rounded-2xl w-full sm:w-auto">Start Your 14-Day Free Trial</Link>
             <button className="text-sm font-bold text-slate-400 hover:text-white px-6 w-full sm:w-auto">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-16 px-6 border-t border-white/5 bg-bg-surface/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Antigravity Logo" fill className="object-contain" />
            </div>
            <span className="text-lg font-bold font-display tracking-tighter">Antigravity</span>
          </div>
          <p className="text-slate-600 text-sm">© 2026 Antigravity Technologies Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Twitter</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">GitHub</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="card p-8 group hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-2">
      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 mb-8">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold font-display mb-4 text-white">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
