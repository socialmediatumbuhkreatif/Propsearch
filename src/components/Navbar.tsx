import React from 'react';
import { Search, BookOpen, Sparkles, UserCheck } from 'lucide-react';
import { ProplabLogo } from './ProplabLogo';

interface NavbarProps {
  activeTab: 'search' | 'dossier' | 'saved' | 'pitch';
  setActiveTab: (tab: 'search' | 'dossier' | 'saved' | 'pitch') => void;
  savedCount: number;
  hasActiveDossier: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  hasActiveDossier
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - PropSearch */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('search')}>
          <div className="w-10 h-10 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center p-1.5 shadow-sm hover:border-blue-300 transition-colors">
            <ProplabLogo className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Prop<span className="text-blue-600">Search</span>
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Proplab.ai
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">AI Property Buyer Intelligence & Lead Profiling</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3.5 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Cari Pembeli</span>
            <span className="md:hidden">Cari</span>
          </button>

          {hasActiveDossier && (
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'dossier'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Profil Buyer Aktif</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Database Prospect</span>
            <span className="md:hidden">Database</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          {hasActiveDossier && (
            <button
              onClick={() => setActiveTab('pitch')}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'pitch'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Skrip WA & Follow-Up</span>
            </button>
          )}
        </nav>

        {/* Live Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-[11px]">Proplab AI Engine Active</span>
        </div>
      </div>
    </header>
  );
};

