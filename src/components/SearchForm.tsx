import React, { useState } from 'react';
import { Search, Phone, MapPin, Share2, SlidersHorizontal, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { ProfileSearchRequest } from '../types';
import { ProplabLogo } from './ProplabLogo';

interface SearchFormProps {
  onSearch: (request: ProfileSearchRequest) => void;
  isLoading: boolean;
}

const SAMPLE_BUYER_PROMPTS = [
  { label: 'Pak Budi (Pengusaha BSD)', query: 'Pak Budi Pengusaha Jakarta', residence: 'BSD City' },
  { label: 'Dr. Anita (Surabaya Barat)', query: 'Dr. Anita Sp.A Surabaya', residence: 'Citraland Surabaya' },
  { label: 'Eksekutif Bank (Pondok Indah)', query: 'Ibu Maya Senior Executive Bank Jakarta', residence: 'Pondok Indah' },
  { label: '081234567890 (Direct WA)', query: '', phone: '081234567890', residence: 'Gading Serpong' },
];

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  // Main Search Input
  const [searchQuery, setSearchQuery] = useState('');

  // Additional Buyer Filters
  const [phoneNumber, setPhoneNumber] = useState('');
  const [residence, setResidence] = useState('');
  const [socialMediaLink, setSocialMediaLink] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchQuery.trim();
    const cleanPhone = phoneNumber.trim();
    const cleanResidence = residence.trim();
    const cleanSocial = socialMediaLink.trim();

    if (!cleanSearch && !cleanPhone && !cleanResidence && !cleanSocial) return;

    const effectiveName = cleanSearch || (cleanPhone ? `Buyer WA ${cleanPhone}` : cleanSocial ? `Buyer ${cleanSocial}` : `Buyer Area ${cleanResidence || 'Strategis'}`);

    onSearch({
      name: effectiveName,
      phoneNumber: cleanPhone || undefined,
      residence: cleanResidence || undefined,
      socialMediaLink: cleanSocial || undefined,
      location: cleanResidence || undefined,
      targetBudget: undefined,
      propertyType: undefined,
      buyerCategory: undefined,
      openaiApiKey: openaiApiKey.trim() || undefined,
    });
  };


  const handleSampleClick = (sample: typeof SAMPLE_BUYER_PROMPTS[0]) => {
    if (sample.query) setSearchQuery(sample.query);
    if (sample.phone) setPhoneNumber(sample.phone);
    if (sample.residence) setResidence(sample.residence);
  };

  const isSubmitDisabled = isLoading || (!searchQuery.trim() && !phoneNumber.trim() && !residence.trim() && !socialMediaLink.trim());

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 pt-2">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-sm flex items-center justify-center">
            <ProplabLogo className="w-full h-full" />
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>PROPSEARCH • POWERED BY PROPLAB.AI</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Cari & Profilkan <span className="text-blue-600">Calon Pembeli</span> Properti
        </h1>

        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
          Ketik nama, nomor HP, atau lokasi buyer untuk mendapatkan analisis karakter, estimasi budget, dan skrip WhatsApp follow-up otomatis.
        </p>
      </div>

      {/* Main Search Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Input Field */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama pembeli, lokasi, nomor HP, atau bisnis..."
                className="block w-full pl-11 pr-32 py-4 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 text-base font-medium transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="absolute right-2 top-2 bottom-2 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl flex items-center space-x-1.5 text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Cari Buyer</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 mr-1">Contoh Cepat:</span>
              {SAMPLE_BUYER_PROMPTS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleClick(s)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors"
                >
                  ⚡ {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Optional Section */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 py-1 transition-colors"
            >
              <span className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Informasi Detail Tambahan (WhatsApp, Domisili, Medsos)</span>
              </span>
              <span className="flex items-center space-x-1 text-blue-600 font-extrabold">
                <span>{showAdditionalFilters ? 'Sembunyikan' : 'Tambah Filter'}</span>
                {showAdditionalFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {showAdditionalFilters && (
              <div className="mt-4 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Nomor HP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Nomor WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="081234567890"
                      className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>

                  {/* Domisili / Lokasi */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lokasi Target / Domisili</span>
                    </label>
                    <input
                      type="text"
                      value={residence}
                      onChange={(e) => setResidence(e.target.value)}
                      placeholder="BSD City, Surabaya, Jaksel"
                      className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Social Media */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Link Social Media</span>
                    </label>
                    <input
                      type="text"
                      value={socialMediaLink}
                      onChange={(e) => setSocialMediaLink(e.target.value)}
                      placeholder="linkedin.com/in/nama"
                      className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Optional Custom OpenAI API Key */}
                <div className="pt-3 border-t border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>OpenAI API Key Kustom (Opsional — default menggunakan server PropSearch):</span>
                  </label>
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-proj-... (opsional)"
                    className="w-full sm:w-1/2 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/20 text-sm sm:text-base tracking-wide"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>PropSearch AI Menganalisis Profil Buyer...</span>
              </span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>PROFILKAN PEMBELI SEKARANG</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

