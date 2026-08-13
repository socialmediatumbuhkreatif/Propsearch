import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchForm } from './components/SearchForm';
import { LoadingOverlay } from './components/LoadingOverlay';
import { DossierReportView } from './components/DossierReportView';
import { SavedLibrary } from './components/SavedLibrary';
import { PitchStudio } from './components/PitchStudio';
import { ProfileSearchRequest, PropertyBuyerDossier } from './types';

const STORAGE_KEY = 'prosearch_saved_buyers_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'dossier' | 'saved' | 'pitch'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingName, setLoadingName] = useState('');
  const [activeDossier, setActiveDossier] = useState<PropertyBuyerDossier | null>(null);
  const [savedDossiers, setSavedDossiers] = useState<PropertyBuyerDossier[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved dossiers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedDossiers(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Gagal memuat profil tersimpan:", e);
    }
  }, []);

  // Save to localStorage when savedDossiers changes
  const saveToStorage = (list: PropertyBuyerDossier[]) => {
    setSavedDossiers(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Gagal menyimpan profil:", e);
    }
  };

  const handleSearch = async (req: ProfileSearchRequest) => {
    setIsLoading(true);
    setLoadingName(req.name);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error("API non-JSON response:", response.status, text);
        setErrorMessage(`Gagal terhubung ke server API (${response.status}). Silakan coba beberapa saat lagi.`);
        return;
      }

      const data = await response.json();

      if (data.success && data.dossier) {
        setActiveDossier(data.dossier);
        setActiveTab('dossier');
      } else {
        setErrorMessage(data.error || 'Gagal membuat profil calon pembeli.');
      }
    } catch (err: any) {
      console.error("Search API Error:", err);
      setErrorMessage(err?.message || 'Terjadi kesalahan jaringan saat membuat profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDossier = (dossier: PropertyBuyerDossier) => {
    const buyerName = dossier.buyerProfile?.name || (dossier as any).target?.name;
    const exists = savedDossiers.some((d) => d.id === dossier.id || (d.buyerProfile?.name === buyerName));
    if (exists) {
      // Remove if already saved (toggle)
      const updated = savedDossiers.filter((d) => d.id !== dossier.id && (d.buyerProfile?.name !== buyerName));
      saveToStorage(updated);
    } else {
      const updated = [dossier, ...savedDossiers];
      saveToStorage(updated);
    }
  };

  const handleRemoveDossier = (id: string) => {
    const updated = savedDossiers.filter((d) => d.id !== id);
    saveToStorage(updated);
  };

  const handleClearAllSaved = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua profil pembeli yang tersimpan?")) {
      saveToStorage([]);
    }
  };

  const currentBuyerName = activeDossier?.buyerProfile?.name || (activeDossier as any)?.target?.name;
  const isCurrentSaved = activeDossier
    ? savedDossiers.some((d) => d.id === activeDossier.id || (d.buyerProfile?.name === currentBuyerName))
    : false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedDossiers.length}
        hasActiveDossier={!!activeDossier}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Notification */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between text-sm shadow-sm">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 font-bold hover:underline text-xs"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Loading Screen */}
        {isLoading ? (
          <LoadingOverlay targetName={loadingName} />
        ) : (
          <>
            {activeTab === 'search' && (
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            )}

            {activeTab === 'dossier' && activeDossier && (
              <DossierReportView
                dossier={activeDossier}
                onSave={handleSaveDossier}
                isSaved={isCurrentSaved}
                onOpenPitchStudio={() => setActiveTab('pitch')}
                onNewSearch={() => setActiveTab('search')}
              />
            )}

            {activeTab === 'saved' && (
              <SavedLibrary
                savedDossiers={savedDossiers}
                onSelectDossier={(dossier) => {
                  setActiveDossier(dossier);
                  setActiveTab('dossier');
                }}
                onRemoveDossier={handleRemoveDossier}
                onClearAll={handleClearAllSaved}
              />
            )}

            {activeTab === 'pitch' && activeDossier && (
              <PitchStudio
                dossier={activeDossier}
                onBack={() => setActiveTab('dossier')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white text-slate-500 border-t border-slate-200 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-600">PropSearch by Proplab.ai • AI Property Buyer Intelligence & Lead Profiling Platform</span>
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Powered by Proplab AI Engine & Gemini Grounding
          </span>
        </div>
      </footer>
    </div>
  );
}

