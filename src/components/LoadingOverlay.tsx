import React, { useEffect, useState } from 'react';
import { Shield, Search, Globe, FileText, CheckCircle2 } from 'lucide-react';

interface LoadingOverlayProps {
  targetName: string;
}

const SCAN_STEPS = [
  'Initializing OSINT search protocols & Google Search Grounding...',
  'Retrieving public records, news articles, and press announcements...',
  'Extracting corporate directorships, company affiliations, and career history...',
  'Scanning wealth indicators, investments, and real estate footprint...',
  'Analyzing public sentiment & key statements from media sources...',
  'Synthesizing personalized B2B sales intelligence & conversation hooks...',
  'Finalizing Public Intelligence Dossier Report...'
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ targetName }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-3xl mx-auto my-8 space-y-8">
      {/* Pulse Radar Icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center relative z-10 shadow-md shadow-blue-500/10">
          <Shield className="w-10 h-10 text-blue-600 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping"></div>
        <div className="absolute -inset-4 rounded-full border border-blue-300 animate-spin" style={{ animationDuration: '8s' }}></div>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-bold px-4 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
          <Search className="w-3.5 h-3.5 animate-bounce text-blue-600" />
          <span>PropSearch Engine • Proplab.ai Intelligence</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Menganalisis Prospek "{targetName}"
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          PropSearch AI sedang menyintesis data publik, indikator minat rumah, serta psikologi calon pembeli...
        </p>
      </div>

      {/* Progress Steps List */}
      <div className="w-full max-w-lg bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
        {SCAN_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div key={idx} className="flex items-center space-x-3 text-xs sm:text-sm">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0"></div>
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
              )}
              <span
                className={`font-medium ${
                  isDone
                    ? 'text-slate-400 line-through'
                    : isCurrent
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grounding Source Badge */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 pt-2 border-t border-slate-200/80 font-medium">
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <span>Proplab AI Engine & Gemini Grounding Active</span>
      </div>
    </div>
  );
};
