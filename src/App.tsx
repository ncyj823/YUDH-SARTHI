import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'citizen' | 'authority'>('citizen');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1500);
  };

  if (isLoggedIn) {
    return <Dashboard userRole={authMode} onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-red-600 rounded-2xl shadow-2xl shadow-red-600/20 mb-2">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
            Rapid Crisis<br />Response
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
            Emergency Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#141414] p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {/* Mode Selector */}
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
            <button 
              onClick={() => setAuthMode('citizen')}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                authMode === 'citizen' ? "bg-white/10 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Citizen
            </button>
            <button 
              onClick={() => setAuthMode('authority')}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                authMode === 'authority' ? "bg-white/10 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Authority
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                {authMode === 'citizen' ? 'Aadhar / PAN Number' : 'Authority ID'}
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder={authMode === 'citizen' ? "XXXX-XXXX-XXXX" : "GOV-ADM-XXXX"}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                Security Key / OTP
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-mono"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-sm">Secure Access</span>
                  <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-200/70 leading-relaxed font-medium">
              By logging in, you agree to emergency data sharing protocols. Your location will be tracked for safety purposes.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            End-to-End Encrypted • Low Bandwidth Optimized
          </p>
          <div className="flex justify-center gap-4 text-[9px] text-zinc-700 font-bold uppercase">
            <a href="#" className="hover:text-zinc-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-500 transition-colors">Emergency Terms</a>
            <a href="#" className="hover:text-zinc-500 transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
