import React, { useState } from 'react';
import { Sparkles, MessageSquare, Copy, Check, ArrowLeft, MessageCircle } from 'lucide-react';
import { PropertyBuyerDossier } from '../types';

interface PitchStudioProps {
  dossier: PropertyBuyerDossier;
  onBack: () => void;
}

export const PitchStudio: React.FC<PitchStudioProps> = ({ dossier, onBack }) => {
  const [offeringType, setOfferingType] = useState('Rumah Tapak Cluster Minimalis');
  const [customNotes, setCustomNotes] = useState('Tekankan lokasi strategis, bebas banjir, dan skema KPR DP ringan.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pitchResult, setPitchResult] = useState<any>(null);
  const [copiedWa, setCopiedWa] = useState(false);

  const buyer = dossier.buyerProfile || (dossier as any).target || {};
  const buyerName = buyer.name || "Calon Pembeli";

  const handleGeneratePitch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setPitchResult(null);

    try {
      const response = await fetch('/api/pitch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dossier,
          offeringType,
          customNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPitchResult(data.pitch);
      } else {
        alert('Gagal membuat skrip follow-up.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyWaScript = () => {
    if (!pitchResult) return;
    const textToCopy = pitchResult.emailBody || pitchResult.whatsAppMessage || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Kembali ke Laporan Profil</span>
        </button>

        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">PropLab AI Studio WA</span>
        </div>
      </div>

      {/* Target Brief Bar */}
      <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 space-y-1 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Target Profil Pembeli</span>
        <h2 className="text-2xl font-black text-slate-900">{buyerName}</h2>
        <p className="text-xs text-slate-600 font-medium">{buyer.jobTitle || buyer.primaryTitle} {buyer.company ? `di ${buyer.company}` : ''}</p>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <span>Konfigurasi Penawaran Properti & Gaya Follow-Up</span>
        </h3>

        <form onSubmit={handleGeneratePitch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori / Tipe Rumah Ditawarkan
              </label>
              <select
                value={offeringType}
                onChange={(e) => setOfferingType(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 bg-slate-50 focus:border-blue-600 focus:outline-none"
              >
                <option value="Rumah Tapak Cluster Minimalis">Rumah Tapak Cluster Minimalis</option>
                <option value="Apartemen Modern & Strategic">Apartemen / Hunian Vertikal</option>
                <option value="Rumah Mewah & Hook Exclusive">Rumah Mewah & Hook Eksklusif</option>
                <option value="Ruko / Properti Komersial">Ruko & Usaha Komersial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Poin Penekanan Khusus (Custom Angle)
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Contoh: Bebas banjir, promo DP 0%, dekat tol..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-md shadow-blue-500/20 text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>PropSearch AI Membuat Skrip WA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Buat Skrip WA & Panduan Handling Keberatan</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Pitch Results */}
      {pitchResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* WA Message Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Skrip Pesan WhatsApp Follow-Up PropLab AI</span>
              </h3>
              <button
                onClick={copyWaScript}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
              >
                {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
                <span>{copiedWa ? 'Tersalin' : 'Salin Pesan WA'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs sm:text-sm">
              <div className="whitespace-pre-line text-slate-800 leading-relaxed font-sans font-medium">
                {pitchResult.emailBody || pitchResult.whatsAppMessage}
              </div>
            </div>
          </div>

          {/* Objection Handling Matrix */}
          {pitchResult.objectionHandling && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Panduan Menjawab Keberatan & Keraguan Buyer</span>
              </h3>

              <div className="space-y-3">
                {pitchResult.objectionHandling.map((item: any, i: number) => (
                  <div key={i} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 space-y-1 text-xs">
                    <p className="font-bold text-amber-900">Potensi Keberatan #{i + 1}: "{item.objection}"</p>
                    <p className="text-slate-700 font-medium pt-1">Rekomendasi Cara Jawab: {item.response}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

