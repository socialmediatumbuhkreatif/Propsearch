import React, { useState } from 'react';
import {
  Shield, User, Building, MapPin, CheckCircle2,
  ExternalLink, Bookmark, Sparkles, Printer, Copy, Check,
  DollarSign, Home, MessageCircle, Heart, AlertTriangle,
  ArrowLeft, Compass, FileText, Target, HelpCircle, Send,
  ListOrdered, Award
} from 'lucide-react';
import { PropertyBuyerDossier } from '../types';
import { ProplabLogo } from './ProplabLogo';

interface DossierReportViewProps {
  dossier: PropertyBuyerDossier;
  onSave: (dossier: PropertyBuyerDossier) => void;
  isSaved: boolean;
  onOpenPitchStudio: () => void;
  onNewSearch: () => void;
}

export const DossierReportView: React.FC<DossierReportViewProps> = ({
  dossier,
  onSave,
  isSaved,
  onOpenPitchStudio,
  onNewSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'report6' | 'house' | 'psychology' | 'sources'>('report6');
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<string | null>(null);
  const [copiedFullReport, setCopiedFullReport] = useState(false);

  // Normalize data safely
  const buyer = dossier.buyerProfile || (dossier as any).target || {};
  const buyerName = buyer.name || "Calon Pembeli";
  const jobTitle = buyer.jobTitle || buyer.primaryTitle || "Eksekutif";
  const companyName = buyer.company || buyer.organization || "Perusahaan Swasta";
  const currentResidence = buyer.currentResidence || buyer.location || "Indonesia";
  const originRegion = buyer.originOrBackground || buyer.originRegion || "Indonesia";
  const estimatedBudget = buyer.estimatedBudget || "Rp 2.5 Miliar - Rp 5 Miliar";

  // Section 1: Ringkasan Profil
  const profileSummary = dossier.profileSummary || {
    overview: buyer.summary || `${buyerName} merupakan profesional/pengusaha di bidang ${jobTitle} di ${companyName} yang berdomisili atau memiliki aktivitas profesional utama di kawasan ${currentResidence}.`,
    experienceHighlights: [
      `Aktivitas profesional utama sebagai ${jobTitle} di ${companyName}`,
      `Aktivitas & jejaring terhubung erat dengan kawasan ${currentResidence}`,
      `Fokus pengembangan bisnis & kepemimpinan operasional`,
      `Rekam jejak publik menunjukkan keterlibatan aktif di ekosistem komersial`
    ],
    professionalCharacter: `Profil profesional/bisnis yang entrepreneurial, berorientasi pada produktivitas & keluarga, aktif membangun jaringan, dan terbuka pada peluang kepemilikan aset properti bernilai tambah.`
  };

  // Section 2: Assessment Matrix
  const prospectAssessment = dossier.prospectAssessment || {
    leadScore: 72,
    leadScoreText: "72/100 — Prospek Potensial, Belum Qualified",
    scoreDisclaimer: "Nilai ini bukan skor kemampuan finansial. Prospek baru dapat dianggap qualified secara efektif setelah kebutuhan, budget, skema pembayaran, dan jangka waktu dikonfirmasi.",
    matrix: [
      {
        aspect: "Potensi kebutuhan properti",
        rating: "Tinggi",
        reasoning: `${jobTitle} / pengelola bisnis berpotensi membutuhkan hunian keluarga sekaligus ruang produktif.`
      },
      {
        aspect: "Kemampuan membeli",
        rating: "Belum terverifikasi",
        reasoning: "Jabatan atau usaha tidak otomatis menunjukkan arus kas dan kapasitas kredit riil."
      },
      {
        aspect: "Potensi KPR",
        rating: "Menengah",
        reasoning: "Pendapatan memadai, namun perlu persiapan pembuktian penghasilan yang lebih terstruktur."
      },
      {
        aspect: "Kebutuhan investasi",
        rating: "Menengah–tinggi",
        reasoning: "Latar belakang profesional/bisnis membuat pendekatan berbasis aset & capital gain relevan."
      },
      {
        aspect: `Kesesuaian lokasi ${currentResidence}`,
        rating: "Tinggi",
        reasoning: `Aktivitas profesional & domisili prospek terhubung langsung dengan kawasan ${currentResidence}.`
      },
      {
        aspect: "Kemungkinan closing cepat",
        rating: "Belum dapat ditentukan",
        reasoning: "Belum diketahui urgensi kebutuhan, anggaran pasti, status kepemilikan rumah, dan waktunya."
      }
    ]
  };

  // Section 3: Relevant Properties
  const relevantProperties = dossier.relevantProperties || [
    {
      productTitle: `Rumah compact di ${currentResidence} atau kawasan penyangga`,
      reasonAndAngle: "Cocok untuk profesional muda yang mencari hunian pertama, ruang kerja tambahan, dan akses cepat ke pusat aktivitas bisnis."
    },
    {
      productTitle: "SOHO atau rumah dengan ruang kerja fleksibel",
      reasonAndAngle: "Angle yang cukup kuat untuk pekerjaan yang berhubungan dengan meeting, produksi kreatif, dan pengelolaan tim."
    },
    {
      productTitle: "Apartemen dekat pusat bisnis",
      reasonAndAngle: "Dapat diposisikan sebagai hunian praktis mobilitas tinggi atau aset investasi yang mudah dikelola."
    },
    {
      productTitle: "Properti investasi dengan potensi sewa",
      reasonAndAngle: "Cocok jika tujuannya adalah aset investasi. Presentasi harus berisi angka konkret estimasi sewa, biaya, dan okupansi kawasan."
    }
  ];

  // Section 4: Buying Triggers
  const buyingTriggers = dossier.buyingTriggers || [
    "Apakah saat ini tinggal sendiri, bersama keluarga, atau menyewa?",
    "Apakah sedang merencanakan rumah pertama?",
    "Apakah membutuhkan ruang kerja atau studio pribadi di rumah?",
    "Apakah lebih tertarik pada hunian pribadi atau aset investasi?",
    "Apakah ada kebutuhan pindah dalam 6–12 bulan ke depan?",
    "Apakah pembelian direncanakan secara tunai, KPR, atau cicilan developer?"
  ];

  // Section 5: Communication Approach
  const communicationApproach = dossier.communicationApproach || {
    styleStrategy: "Karena latar belakang profesionalnya, hindari pesan generik atau promo murah. Gunakan pendekatan ringkas, spesifik, dan berbasis manfaat.",
    firstWaMessage: `Halo Bapak/Ibu ${buyerName}, saya melihat aktivitas Anda cukup aktif di kawasan ${currentResidence}. Saya sedang menangani beberapa properti compact yang menarik untuk profesional—bisa difungsikan sebagai hunian, ruang kerja, sekaligus aset.\n\nSebelum saya kirim rekomendasinya, saat ini Anda lebih relevan mencari hunian pribadi, ruang produktif untuk usaha, atau properti investasi?`,
    qualificationFollowUpMessage: `Siap Bapak/Ibu ${buyerName}. Supaya pilihannya tidak terlalu banyak dan benar-benar relevan, boleh saya sesuaikan berdasarkan tiga hal: area yang diinginkan, kisaran anggaran, dan target pembelian?`
  };

  // Section 6: Offer Strategy & Conclusion
  const offerStrategyAndConclusion = dossier.offerStrategyAndConclusion || {
    strategyPoints: [
      "Sajikan maksimal tiga pilihan, bukan katalog panjang.",
      "Gunakan perbandingan berbasis fungsi: hunian, ruang kerja, dan investasi.",
      "Sertakan simulasi uang muka dan cicilan, tetapi jangan menyimpulkan kemampuan membayarnya.",
      "Gunakan visual dan data lokasi yang rapi.",
      "Tawarkan survei lokasi hanya setelah kebutuhan dasarnya terkonfirmasi.",
      "Jika belum siap membeli, masukkan sebagai nurture lead dan hubungi kembali berdasarkan waktu yang disepakati."
    ],
    objectiveConclusion: `Kesimpulan paling objektif: ${buyerName} mempunyai kecocokan profil sebagai calon pembeli properti, terutama untuk rumah compact, SOHO, atau aset investasi di area ${currentResidence}. Namun, jejak profesional tidak cukup untuk menyatakan pasti mampu atau sedang ingin membeli. Prioritas agen adalah melakukan qualification secara sopan sebelum memberikan rekomendasi produk.`
  };

  const psychology = dossier.psychologyAndBehavior || {
    communicationStyle: "Sopan, profesional, menyukai penjelasan yang ringkas dan jelas via pesan WhatsApp.",
    decisionMakerType: "Pengambil keputusan utama bersama keluarga / pasangan.",
    personalityTraits: ["Sangat memperhatikan kepraktisan lokasi & akses", "Memperhitungkan kenyamanan jangka panjang keluarga", "Menyukai pengembang bereputasi baik"],
    preferredChannel: "WhatsApp Chat"
  };

  const dreamHouse = dossier.dreamHouseCriteria || {
    preferredLocations: [currentResidence],
    propertyType: "Rumah Tapak Cluster Modern / Townhouse",
    mustHaveFacilities: ["Keamanan 24 Jam dengan One Gate System", "Carport / Garasi", "Taman Hunian Asri", "Akses Jalan Lebar & Bebas Banjir"],
    buyingMotivation: "Hunian Utama Keluarga",
    idealHouseDescription: `Rumah bergaya modern di lingkungan cluster eksklusif area ${currentResidence}, bebas banjir, dengan fasilitas lengkap dan akses cepat ke jalur utama.`
  };

  const sources = dossier.sources || [];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIndex(id);
    setTimeout(() => setCopiedScriptIndex(null), 2000);
  };

  const handleCopyFullReport = () => {
    const fullText = `PROFIL PROSPEK PROPERTI: ${buyerName.toUpperCase()}
1. Ringkasan Profil:
${profileSummary.overview}

2. Penilaian Sebagai Prospek Properti:
Lead Score: ${prospectAssessment.leadScoreText}
${prospectAssessment.scoreDisclaimer}

3. Properti yang Kemungkinan Relevan:
${relevantProperties.map((p, i) => `${i + 1}. ${p.productTitle}\n   Angle: ${p.reasonAndAngle}`).join('\n')}

4. Buying Trigger yang Perlu Digali:
${buyingTriggers.map((t, i) => `• ${t}`).join('\n')}

5. Pendekatan Komunikasi WA:
${communicationApproach.firstWaMessage}

6. Kesimpulan Objektif:
${offerStrategyAndConclusion.objectiveConclusion}

Dianalisis melalui PropSearch Engine • Powered by PropLab.ai`;

    navigator.clipboard.writeText(fullText);
    setCopiedFullReport(true);
    setTimeout(() => setCopiedFullReport(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-fadeIn font-sans">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
        <button
          onClick={onNewSearch}
          className="flex items-center space-x-2 text-slate-700 hover:text-blue-600 text-xs sm:text-sm font-extrabold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Cari Pembeli Lain</span>
        </button>

        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => onSave(dossier)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              isSaved
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
            <span>{isSaved ? 'Tersimpan di PropSearch CRM' : 'Simpan Profil'}</span>
          </button>

          <button
            onClick={onOpenPitchStudio}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Skrip WA</span>
          </button>

          <button
            onClick={handleCopyFullReport}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center space-x-1.5 transition-all"
          >
            {copiedFullReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
            <span>{copiedFullReport ? 'Tersalin!' : 'Salin Laporan PDF/Text'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center space-x-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Primary Banner Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ProplabLogo className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider rounded-full border border-blue-400/30 flex items-center space-x-1.5">
              <ProplabLogo className="w-3.5 h-3.5" />
              <span>PropSearch Buyer Intelligence Report</span>
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider rounded-full border border-emerald-400/30">
              Target Budget: {estimatedBudget}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Profil Prospek Properti: {buyerName}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-semibold mt-1 flex items-center space-x-2 flex-wrap">
              <span>{jobTitle}</span>
              {companyName && <span>• {companyName}</span>}
              {currentResidence && <span className="text-blue-400">📍 {currentResidence}</span>}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400 flex-wrap gap-2">
            <div className="flex items-center space-x-4">
              <span>Lead Score: <strong className="text-emerald-400 font-mono">{prospectAssessment.leadScore}/100</strong></span>
              <span>Kategori: <strong className="text-white">{buyer.buyingIntent || "Warm Prospect"}</strong></span>
            </div>
            <span className="text-[11px] text-slate-400 italic">Dianalisis secara objektif oleh PropLab.ai</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-sm flex overflow-x-auto space-x-1 print:hidden">
        {[
          { id: 'report6', label: '1-6 Laporan Analisis Lengkap', icon: FileText },
          { id: 'house', label: 'Kriteria Rumah Impian', icon: Home },
          { id: 'psychology', label: 'Psikologi & Profil Buyer', icon: Heart },
          { id: 'sources', label: `Sumber Data Google (${sources.length})`, icon: ExternalLink },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center space-x-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FULL 6-SECTION REPORT */}
      {activeTab === 'report6' && (
        <div className="space-y-8 animate-fadeIn">
          {/* SECTION 1: RINGKASAN PROFIL */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 text-slate-900">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">1</div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Ringkasan Profil</h2>
            </div>

            <p className="text-slate-700 leading-relaxed text-sm font-medium">
              {profileSummary.overview}
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jejak pengalaman profesional & fakta yang ditemukan:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profileSummary.experienceHighlights?.map((item: string, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 flex items-start space-x-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs font-medium text-slate-800 space-y-1">
              <span className="font-bold text-blue-700 uppercase tracking-wider block text-[10px]">Karakter Profesional:</span>
              <p className="leading-relaxed">{profileSummary.professionalCharacter}</p>
            </div>
          </section>

          {/* SECTION 2: PENILAIAN SEBAGAI PROSPEK PROPERTI */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">2</div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Penilaian Sebagai Prospek Properti</h2>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
                Lead Score Awal: {prospectAssessment.leadScore}/100
              </span>
            </div>

            {/* Assessment Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3.5">Aspek</th>
                    <th className="p-3.5">Penilaian</th>
                    <th className="p-3.5">Dasar Analisis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {prospectAssessment.matrix?.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <td className="p-3.5 font-bold text-slate-900">{row.aspect}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] inline-block ${
                          row.rating.toLowerCase().includes('tinggi')
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.rating.toLowerCase().includes('menengah')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {row.rating}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium leading-relaxed">{row.reasoning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lead Score Callout Box */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Lead score awal: {prospectAssessment.leadScoreText}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {prospectAssessment.scoreDisclaimer}
              </p>
            </div>
          </section>

          {/* SECTION 3: PROPERTI YANG KEMUNGKINAN RELEVAN */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 text-slate-900">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">3</div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Properti yang Kemungkinan Relevan</h2>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Urutan produk yang paling masuk akal untuk ditawarkan kepada {buyerName}:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantProperties?.map((prop, idx) => (
                <div key={idx} className="p-5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-2xl space-y-2 transition-all">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">{prop.productTitle}</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed pl-8">
                    {prop.reasonAndAngle}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: BUYING TRIGGER YANG PERLU DIGALI */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 text-slate-900">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">4</div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Buying Trigger yang Perlu Digali Agen</h2>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs font-extrabold text-amber-900 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Panduan Kualifikasi: Jangan memulai dengan “mau beli rumah atau tidak”. Cari pemicunya terlebih dahulu:</span>
            </div>

            <div className="space-y-2.5">
              {buyingTriggers?.map((q, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: PENDEKATAN KOMUNIKASI YANG DISARANKAN */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">5</div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Pendekatan Komunikasi yang Disarankan</h2>
              </div>
              <button
                onClick={onOpenPitchStudio}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buka Generator Skrip Studio</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              💡 {communicationApproach.styleStrategy}
            </p>

            {/* WA Script 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Contoh Pesan WA Pembuka Pertama (Berbasis Manfaat):</span>
                </span>
                <button
                  onClick={() => handleCopyText(communicationApproach.firstWaMessage, 'wa1')}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 flex items-center space-x-1"
                >
                  {copiedScriptIndex === 'wa1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-600" />}
                  <span>{copiedScriptIndex === 'wa1' ? 'Tersalin!' : 'Salin Pesan'}</span>
                </button>
              </div>
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-xs text-slate-900 font-medium whitespace-pre-line leading-relaxed italic">
                "{communicationApproach.firstWaMessage}"
              </div>
            </div>

            {/* WA Script 2 */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Pesan Follow-up Lanjutan (Jika Sudah Merespons):</span>
                </span>
                <button
                  onClick={() => handleCopyText(communicationApproach.qualificationFollowUpMessage, 'wa2')}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 flex items-center space-x-1"
                >
                  {copiedScriptIndex === 'wa2' ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3 text-blue-600" />}
                  <span>{copiedScriptIndex === 'wa2' ? 'Tersalin!' : 'Salin Pesan'}</span>
                </button>
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl text-xs text-slate-900 font-medium whitespace-pre-line leading-relaxed italic">
                "{communicationApproach.qualificationFollowUpMessage}"
              </div>
            </div>
          </section>

          {/* SECTION 6: STRATEGI PENAWARAN & KESIMPULAN OBJEKTIF */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-slate-900">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">6</div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Strategi Penawaran & Kesimpulan Paling Objektif</h2>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Langkah Strategi Penawaran Agen:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {offerStrategyAndConclusion.strategyPoints?.map((st, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Objective Conclusion Callout */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Kesimpulan Paling Objektif Agen Properti</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {offerStrategyAndConclusion.objectiveConclusion}
              </p>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: DREAM HOUSE CRITERIA */}
      {activeTab === 'house' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-slate-900 animate-fadeIn">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Home className="w-5 h-5 text-blue-600" />
            <span>Kriteria Rumah Impian Calon Pembeli</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tipe Properti Favorit</span>
              <p className="text-sm font-extrabold text-slate-900">{dreamHouse.propertyType}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Estimasi Budget</span>
              <p className="text-sm font-extrabold text-emerald-600">{estimatedBudget}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase block">Gambaran Rumah Ideal:</span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{dreamHouse.idealHouseDescription}</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase block">Fasilitas Wajib Ada:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dreamHouse.mustHaveFacilities?.map((fac, i) => (
                <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PSYCHOLOGY & BUYER PROFILE */}
      {activeTab === 'psychology' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-slate-900 animate-fadeIn">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Heart className="w-5 h-5 text-blue-600" />
            <span>Profil Psikologi & Karakter Pembeli</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gaya Komunikasi</span>
              <p className="font-extrabold text-blue-600 text-xs">{psychology.communicationStyle}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pengambil Keputusan</span>
              <p className="font-extrabold text-slate-900 text-xs">{psychology.decisionMakerType}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Kanal Utama</span>
              <p className="font-extrabold text-emerald-600 text-xs">{psychology.preferredChannel}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase block">Karakter Kepribadian:</span>
            <div className="flex flex-wrap gap-2">
              {psychology.personalityTraits?.map((trait, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-full">
                  • {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SOURCES */}
      {activeTab === 'sources' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-slate-900 animate-fadeIn">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            <span>Sumber Penelusuran Publik Google ({sources.length})</span>
          </h3>

          <div className="space-y-3">
            {sources.length > 0 ? (
              sources.map((src: any, i: number) => (
                <a
                  key={i}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between font-bold text-blue-600 group-hover:underline">
                    <span className="truncate max-w-xl">{src.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-2 shrink-0 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-mono">{src.uri}</span>
                  {src.snippet && <p className="text-slate-600 mt-1 line-clamp-2">{src.snippet}</p>}
                </a>
              ))
            ) : (
              <div className="p-4 text-xs text-slate-500 italic bg-slate-50 rounded-2xl">
                Penelusuran publik via Google Search Engine.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
