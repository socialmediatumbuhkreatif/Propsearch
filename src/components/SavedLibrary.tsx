import React, { useState } from 'react';
import { BookOpen, Search, Trash2, Download, ArrowRight, MapPin } from 'lucide-react';
import { PropertyBuyerDossier } from '../types';

interface SavedLibraryProps {
  savedDossiers: PropertyBuyerDossier[];
  onSelectDossier: (dossier: PropertyBuyerDossier) => void;
  onRemoveDossier: (id: string) => void;
  onClearAll: () => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({
  savedDossiers,
  onSelectDossier,
  onRemoveDossier,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDossiers = savedDossiers.filter((d) => {
    const query = searchQuery.toLowerCase();
    const buyer = d.buyerProfile || (d as any).target || {};
    const name = buyer.name || '';
    const job = buyer.jobTitle || buyer.primaryTitle || '';
    const company = buyer.company || buyer.organization || '';
    const residence = buyer.currentResidence || buyer.location || '';
    
    return (
      name.toLowerCase().includes(query) ||
      job.toLowerCase().includes(query) ||
      company.toLowerCase().includes(query) ||
      residence.toLowerCase().includes(query)
    );
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedDossiers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `propsearch_database_buyer_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-slate-900">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Database Prospek Pembeli (PropSearch CRM)</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {savedDossiers.length} profil calon pembeli tersimpan di database intelijen PropLab.ai Anda
          </p>
        </div>

        {savedDossiers.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor JSON</span>
            </button>
            <button
              onClick={onClearAll}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 flex items-center space-x-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Filter */}
      {savedDossiers.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari profil buyer berdasarkan nama, pekerjaan, tempat tinggal..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>
      )}

      {/* Dossier Grid */}
      {filteredDossiers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDossiers.map((dossier) => {
            const buyer = dossier.buyerProfile || (dossier as any).target || {};
            const buyerName = buyer.name || "Calon Pembeli";
            const jobTitle = buyer.jobTitle || buyer.primaryTitle || "Eksekutif";
            const companyName = buyer.company || buyer.organization || "";
            const currentResidence = buyer.currentResidence || buyer.location || "Indonesia";
            const estimatedBudget = buyer.estimatedBudget || "2 - 5 Miliar IDR";

            return (
              <div
                key={dossier.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-blue-500 transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      Budget: {estimatedBudget}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveDossier(dossier.id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Hapus dari tersimpan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {buyerName}
                    </h3>
                    <p className="text-xs text-slate-600 font-semibold">
                      {jobTitle} {companyName ? `(${companyName})` : ''}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5 font-medium">
                      <MapPin className="w-3 h-3 text-blue-600 inline shrink-0" />
                      <span>{currentResidence}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                    {buyer.summary || "Profil calon pembeli rumah."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Disimpan {new Date(dossier.createdAt).toLocaleDateString('id-ID')}
                  </span>
                  <button
                    onClick={() => onSelectDossier(dossier)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all shadow-sm"
                  >
                    <span>Lihat Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Belum Ada Profil Buyer Tersimpan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            {savedDossiers.length === 0
              ? 'Ketika Anda mencari profil calon pembeli di PropSearch, klik "Simpan Profil" untuk mengarsipkan laporan di database PropLab AI.'
              : 'Tidak ada profil tersimpan yang cocok dengan pencarian Anda.'}
          </p>
        </div>
      )}
    </div>
  );
};


