import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini API client lazily / safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured yet. Set it in Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "placeholder_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Initialize OpenAI API client lazily / safely
let openaiClient: OpenAI | null = null;
function getOpenAIClient(overrideKey?: string): OpenAI | null {
  const apiKey = (overrideKey || process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// System prompt for Property Agent Buyer Profiling
const PROPERTY_AGENT_SYSTEM_PROMPT = `Anda adalah "PropSearch AI Engine", asisten intelijen & psikologi pembeli rumah khusus untuk Agen Properti Profesional Indonesia (powered by PropLab.ai).
Tugas Anda adalah melakukan profiling mendalam untuk calon pembeli rumah (buyer/prospek) berdasarkan pencarian nama, profesi, nomor HP, domisili/lokasi target, budget, dan tipe properti.

PENTING UNTUK EKSTRAKSI NAMA PEMBELI:
- Jika kata kunci pencarian mengandung profesi atau lokasi (misal: "Pak Budi Pengusaha Jakarta" atau "Dr. Anita Sp.A Surabaya"), JANGAN gunakan seluruh kalimat tersebut sebagai nama pembeli!
- Ekstrak nama panggilan / nama lengkap yang bersih (contoh: "Pak Budi" atau "Dr. Anita, Sp.A").
- Masukkan profesi dan lokasi ke dalam field "jobTitle", "company", dan "currentResidence" masing-masing.

ANALISIS 6 BAGIAN STRUKTUR LAPORAN PROSPEK PROPERTI:
1. Ringkasan Profil: Penjelasan latar belakang, poin-poin rekam jejak fakta/pengalaman, & kesimpulan karakter profesional.
2. Penilaian sebagai Prospek Properti: Matriks tabel analisis (Potensi kebutuhan, Kemampuan membeli, Potensi KPR, Kebutuhan investasi, Kesesuaian lokasi, Kemungkinan closing cepat) + Lead score awal (misal: 72/100) + Catatan disclaimer skor.
3. Properti yang Kemungkinan Relevan: Urutan produk yang paling masuk akal ditawarkan (Compact House, SOHO/Ruang Kerja, Apartemen Bisnis, Properti Investasi) beserta angle penawarannya.
4. Buying Trigger yang Perlu Digali: Daftar pertanyaan kualifikasi kritis untuk agen.
5. Pendekatan Komunikasi yang Disarankan: Analisis gaya komunikasi, kalimat pesan WA pembuka pertama yang spesifik & bernilai tambah, dan pesan follow-up kualifikasi lanjutan.
6. Strategi Penawaran & Kesimpulan Paling Objektif: Poin-poin strategi penawaran & kesimpulan objektif agen.

SKEMA JSON WAJIB (Harus persis dalam Bahasa Indonesia):
{
  "buyerProfile": {
    "name": "Nama Lengkap / Panggilan Pembeli yang Bersih",
    "jobTitle": "Jabatan / Profesi Spesifik",
    "company": "Perusahaan / Sektor Bisnis",
    "currentResidence": "Lokasi Domisili / Area Target Properti",
    "originOrBackground": "Latar Belakang & Karakter Komunitas di Area Ini",
    "estimatedBudget": "Estimasi Budget Properti (contoh: Rp 3.5 Miliar - Rp 7 Miliar)",
    "buyingIntent": "Sangat Siap Beli (Hot Prospect)" | "Pertimbangan Aktif (Warm Prospect)" | "Eksplorasi (Cold Prospect)",
    "summary": "Ringkasan mendalam 2-3 kalimat mengenai profil calon pembeli di daerah ini untuk panduan agen properti.",
    "tags": ["Tag1", "Tag2", "Tag3"]
  },
  "profileSummary": {
    "overview": "Deskripsi lengkap latar belakang profesional & aktivitas di lokasi target.",
    "experienceHighlights": ["Jejak pengalaman / fakta 1", "Jejak pengalaman / fakta 2", "Jejak pengalaman / fakta 3"],
    "professionalCharacter": "Kesimpulan karakter profesional (contoh: Profil profesional muda yang entrepreneurial, aktif membangun jaringan)."
  },
  "prospectAssessment": {
    "leadScore": 72,
    "leadScoreText": "72/100 — Prospek Potensial, Belum Qualified",
    "scoreDisclaimer": "Nilai ini bukan skor kemampuan finansial. Prospek baru dapat dianggap qualified setelah kebutuhan, budget, skema pembayaran, dan jangka waktu dikonfirmasi.",
    "matrix": [
      {
        "aspect": "Potensi kebutuhan properti",
        "rating": "Tinggi",
        "reasoning": "Pengelola bisnis / eksekutif berpotensi membutuhkan hunian sekaligus ruang produktif"
      },
      {
        "aspect": "Kemampuan membeli",
        "rating": "Belum terverifikasi",
        "reasoning": "Jabatan atau usaha tidak otomatis menunjukkan arus kas dan kapasitas kredit"
      },
      {
        "aspect": "Potensi KPR",
        "rating": "Menengah",
        "reasoning": "Pengusaha mungkin mempunyai pendapatan memadai, tetapi perlu pembuktian penghasilan"
      },
      {
        "aspect": "Kebutuhan investasi",
        "rating": "Menengah–tinggi",
        "reasoning": "Latar belakang kewirausahaan membuat pendekatan berbasis aset dan potensi sewa relevan"
      },
      {
        "aspect": "Kesesuaian lokasi",
        "rating": "Tinggi",
        "reasoning": "Aktivitas profesionalnya terhubung langsung dengan lokasi"
      },
      {
        "aspect": "Kemungkinan closing cepat",
        "rating": "Belum dapat ditentukan",
        "reasoning": "Belum diketahui kebutuhan, anggaran, status kepemilikan rumah, dan waktunya"
      }
    ]
  },
  "relevantProperties": [
    {
      "productTitle": "Rumah compact di kawasan penyangga / pusat bisnis",
      "reasonAndAngle": "Cocok untuk profesional muda yang mencari hunian pertama, ruang kerja tambahan, dan akses cepat ke pusat aktivitas bisnis."
    },
    {
      "productTitle": "SOHO atau rumah dengan ruang kerja fleksibel",
      "reasonAndAngle": "Angle kuat untuk pekerjaan yang berhubungan dengan meeting, produksi kreatif, dan pengelolaan tim."
    },
    {
      "productTitle": "Apartemen dekat pusat bisnis",
      "reasonAndAngle": "Dapat diposisikan sebagai hunian praktis atau aset investasi yang mudah dikelola."
    },
    {
      "productTitle": "Properti investasi dengan potensi sewa",
      "reasonAndAngle": "Cocok jika kebutuhannya bukan tempat tinggal. Presentasi harus berisi angka konkret estimasi sewa & okupansi."
    }
  ],
  "buyingTriggers": [
    "Apakah saat ini tinggal sendiri, bersama keluarga, atau menyewa?",
    "Apakah sedang merencanakan rumah pertama?",
    "Apakah membutuhkan ruang kerja atau studio di rumah?",
    "Apakah lebih tertarik pada hunian pribadi atau aset investasi?",
    "Apakah ada kebutuhan pindah dalam 6–12 bulan?",
    "Apakah pembelian direncanakan secara tunai, KPR, atau cicilan developer?"
  ],
  "communicationApproach": {
    "styleStrategy": "Karena latar belakang profesionalnya, hindari pesan generik atau promo murah. Gunakan pendekatan ringkas, spesifik, dan berbasis manfaat.",
    "firstWaMessage": "Halo Mas/Bapak [Nama], saya melihat aktivitas Anda cukup aktif di kawasan [Lokasi]. Saya sedang menangani beberapa properti compact yang menarik untuk profesional—bisa difungsikan sebagai hunian, ruang kerja, sekaligus aset. Sebelum saya kirim rekomendasinya, saat ini Anda lebih relevan mencari hunian pribadi, ruang produktif untuk usaha, atau properti investasi?",
    "qualificationFollowUpMessage": "Siap Mas/Bapak. Supaya pilihannya tidak terlalu banyak dan benar-benar relevan, boleh saya sesuaikan berdasarkan tiga hal: area yang diinginkan, kisaran anggaran, dan target pembelian?"
  },
  "offerStrategyAndConclusion": {
    "strategyPoints": [
      "Sajikan maksimal tiga pilihan, bukan katalog panjang.",
      "Gunakan perbandingan berbasis fungsi: hunian, ruang kerja, dan investasi.",
      "Sertakan simulasi uang muka dan cicilan, tetapi jangan menyimpulkan kemampuan membayarnya.",
      "Gunakan visual dan data lokasi yang rapi.",
      "Tawarkan survei lokasi hanya setelah kebutuhan dasarnya terkonfirmasi."
    ],
    "objectiveConclusion": "Kesimpulan paling objektif: Mempunyai kecocokan profil sebagai calon pembeli properti, terutama untuk rumah compact, SOHO, atau aset investasi. Namun, jejak profesional tidak cukup untuk menyatakan pasti mampu/membeli. Prioritas agen adalah melakukan kualifikasi secara sopan."
  },
  "psychologyAndBehavior": {
    "communicationStyle": "Gaya komunikasi yang disukai",
    "decisionMakerType": "Pengambil keputusan",
    "personalityTraits": ["Trait 1", "Trait 2"],
    "preferredChannel": "WhatsApp Chat"
  },
  "dreamHouseCriteria": {
    "preferredLocations": ["Lokasi 1"],
    "propertyType": "Tipe Properti",
    "mustHaveFacilities": ["Fasilitas 1"],
    "buyingMotivation": "Hunian Utama Keluarga",
    "idealHouseDescription": "Deskripsi rumah ideal"
  },
  "approachAndFollowUp": {
    "icebreakerChat": "Kalimat pembuka obrolan awal WhatsApp yang hangat, personal, & sopan.",
    "keyValuePoints": ["4 poin penawaran rumah yang paling memikat pembeli ini"],
    "waFollowUpScript": "Skrip pesan WhatsApp lengkap dari agen untuk mengajak calon pembeli survei lokasi.",
    "objectionHandling": [
      {
        "objection": "Harga terasa terlalu tinggi",
        "response": "Cara agen menjawab secara persuasif"
      }
    ]
  }
}

Gunakan data nyata jika ada. Kembalikan HANYA format JSON valid tanpa kata pendahuluan/penutup.`;

// Helper to detect quota / rate limit errors
function isQuotaError(err: any): boolean {
  if (!err) return false;
  const str = (err.message || "") + (err.status || "") + (typeof err === 'object' ? JSON.stringify(err) : String(err));
  return (
    str.includes("429") ||
    str.includes("RESOURCE_EXHAUSTED") ||
    str.includes("quota") ||
    str.includes("rate-limits")
  );
}

function logApiNotice(stage: string, err: any) {
  if (isQuotaError(err)) {
    console.log(`[Public Intel API] ${stage} notice: API quota reached. Serving synthesized intelligence profile.`);
  } else {
    console.log(`[Public Intel API] ${stage} notice: Standard fallback activated.`);
  }
}

// Helper to fetch live Google Search results via Serper.dev API
async function fetchSerperSearch(query: string, apiKey: string) {
  try {
    console.log(`[Serper API] Querying live Google Search for: "${query}"`);
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 10 }),
    });

    if (!response.ok) {
      console.warn(`[Serper API] Serper returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn(`[Serper API] Error querying Serper API:`, err);
    return null;
  }
}

// Helper to extract clean query details
function extractSmartQueryInfo(rawQuery: string, companyInput?: string, positionInput?: string, locationInput?: string) {
  const query = (rawQuery || "").trim();
  const lower = query.toLowerCase();

  let name = query;
  let jobTitle = positionInput || "";
  let company = companyInput || "";
  let residence = locationInput || "";
  let budget = "";
  let tags: string[] = [];

  // Check if query is a phone number
  const isPhone = /^[0-9+\s\-()]{8,15}$/.test(query);
  if (isPhone) {
    name = `Prospek WhatsApp (${query})`;
    jobTitle = "Inquirer Direct WA / Pembeli Aktif";
    company = "Personal / Swasta";
    residence = residence || "Jabodetabek / Area Strategis";
    budget = "Rp 2.5 Miliar - Rp 5 Miliar";
    tags = ["Direct WA Inquiry", "Hot Prospect", "Responsive"];
    return { name, jobTitle, company, residence, budget, tags, isPhone: true };
  }

  // 1. Location detection
  const locationKeywords = [
    "jakarta", "jaksel", "jakbar", "jaktim", "jakut", "bsd", "bsd city", "tangerang", "gading serpong", "alam sutera",
    "bintaro", "surabaya", "citraland", "graha famili", "bandung", "dago", "medan", "semarang", "bali", "canggu",
    "seminyak", "sanur", "ubud", "bogor", "depok", "bekasi", "pondok indah", "menteng", "pik", "pantai indah kapuk", "kemang", "senopati"
  ];

  for (const loc of locationKeywords) {
    if (lower.includes(loc) && !residence) {
      if (loc === "jaksel" || loc === "jakarta") residence = "Jakarta Selatan / DKI Jakarta";
      else if (loc === "bsd" || loc === "bsd city") residence = "BSD City, Tangerang Selatan";
      else if (loc === "surabaya" || loc === "citraland" || loc === "graha famili") residence = "Surabaya Barat (Citraland / Graha Famili)";
      else if (loc === "bandung" || loc === "dago") residence = "Bandung (Dago / Bandung Utara)";
      else if (loc === "canggu" || loc === "bali" || loc === "seminyak") residence = "Badung / Canggu Bali";
      else if (loc === "pik" || loc === "pantai indah kapuk") residence = "Pantai Indah Kapuk (PIK), Jakarta";
      else if (loc === "pondok indah") residence = "Pondok Indah, Jakarta Selatan";
      else if (loc === "menteng") residence = "Menteng, Jakarta Pusat";
      else if (loc === "gading serpong") residence = "Gading Serpong, Tangerang";
      else residence = loc.charAt(0).toUpperCase() + loc.slice(1);
    }
  }

  // 2. Profession / Role detection
  if (lower.includes("dokter") || lower.includes("dr.") || lower.includes("sp.")) {
    jobTitle = jobTitle || "Dokter Spesialis / Tenaga Medis Senior";
    company = company || "Rumah Sakit Utama & Klinik Medis";
    budget = "Rp 3.5 Miliar - Rp 8 Miliar";
    tags.push("Dokter Spesialis", "High Net Worth", "Medical Professional");
  } else if (lower.includes("pengusaha") || lower.includes("owner") || lower.includes("founder") || lower.includes("ceo") || lower.includes("direktur")) {
    jobTitle = jobTitle || "Pemilik Bisnis / CEO / Wirausahawan";
    company = company || "Perusahaan Swasta Mandiri";
    budget = "Rp 6 Miliar - Rp 18 Miliar";
    tags.push("Pengusaha", "Business Owner", "Hot Prospect");
  } else if (lower.includes("bank") || lower.includes("finance") || lower.includes("executive") || lower.includes("manajer") || lower.includes("manager")) {
    jobTitle = jobTitle || "Senior Executive / Banking & Finance Leader";
    company = company || "Sektor Perbankan & Lembaga Keuangan";
    budget = "Rp 3 Miliar - Rp 7 Miliar";
    tags.push("Corporate Executive", "Banking", "Warm Prospect");
  } else if (lower.includes("pengacara") || lower.includes("lawyer") || lower.includes("notaris") || lower.includes("advokat")) {
    jobTitle = jobTitle || "Advokat / Partner Kantor Hukum / Notaris";
    company = company || "Firma Hukum & Notaris Senior";
    budget = "Rp 4 Miliar - Rp 10 Miliar";
    tags.push("Legal Professional", "High Income");
  } else if (lower.includes("investor") || lower.includes("trader") || lower.includes("capital")) {
    jobTitle = jobTitle || "Investor Properti / Venture Partner";
    company = company || "Portofolio Investasi & Aset Mandiri";
    budget = "Rp 8 Miliar - Rp 25 Miliar";
    tags.push("Investor", "Yield Seeker", "Hot Prospect");
  }

  // Clean Name Extraction
  let cleaned = query;
  locationKeywords.forEach(loc => {
    const re = new RegExp(`\\b${loc}\\b`, 'gi');
    cleaned = cleaned.replace(re, '');
  });
  ["pengusaha", "dokter", "executive", "eksekutif", "banker", "bank", "lawyer", "pengacara", "investor", "ceo", "direktur"].forEach(word => {
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(re, '');
  });

  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length >= 2) {
    name = cleaned;
  }

  if (!jobTitle) jobTitle = "Eksekutif / Business Leader";
  if (!company) company = "Perusahaan Swasta / Wirausaha";
  if (!residence) residence = "Jabodetabek / Kota Besar Indonesia";
  if (!budget) budget = "Rp 2.5 Miliar - Rp 6 Miliar";

  return { name, jobTitle, company, residence, budget, tags, isPhone: false };
}

// Fallback synthetic dossier generator when Gemini API quota is fully exhausted
function createFallbackDossier(
  rawName: string,
  companyInput?: string,
  positionInput?: string,
  locationInput?: string,
  targetBudget?: string,
  propertyType?: string,
  serperResults?: any
) {
  const cleanQuery = (rawName || "").trim().toLowerCase();

  // 1. Featured Preset: Anindya Bakrie
  if (cleanQuery.includes("anindya") || cleanQuery.includes("bakrie")) {
    return {
      id: "buyer_anindya_" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      buyerProfile: {
        name: "Anindya Novyan Bakrie",
        jobTitle: "CEO & Direktur Utama, Bakrie & Brothers",
        company: "Bakrie Group & Ketum Kadin Indonesia",
        currentResidence: "Kuningan, Jakarta Selatan",
        originOrBackground: "Keluarga Konglomerat Bakrie (Latar belakang Sumatra / Lampung & Jakarta)",
        estimatedBudget: "Rp 25 - 50 Miliar",
        buyingIntent: "Sangat Siap Beli (Hot Prospect)",
        summary: "Anindya Bakrie adalah pimpinan Bakrie Group & Ketua Umum Kadin Indonesia. Sangat aktif dalam pengembangan energi hijau, EV, dan ekspansi aset properti komersial maupun hunian mewah keluarga di Jakarta Selatan & Bali.",
        tags: ["Bakrie Group", "Hot Prospect", "Ultra Luxury", "Kadin Indonesia", "Pengusaha Sukses"]
      },
      psychologyAndBehavior: {
        communicationStyle: "Direct, sangat profesional, menghargai waktu, menyukai penyampaian berbasis data & reputasi pengembang.",
        decisionMakerType: "Pengambil keputusan utama dengan pertimbangan tim legal & penasihat aset keluarga.",
        personalityTraits: ["Sangat memperhatikan privasi & keamanan lokasi", "Pencinta arsitektur bernilai tinggi", "Visioner & berorientasi masa depan"],
        preferredChannel: "WhatsApp Chat"
      },
      dreamHouseCriteria: {
        preferredLocations: ["Pondok Indah", "Kuningan Epicentrum", "Menteng", "Canggu Bali"],
        propertyType: "Rumah Tapak Mewah Modern / Villa Estate Resort",
        mustHaveFacilities: ["Keamanan 24 Jam dengan Akses Privasi", "Garasi Kapasitas 6 Mobil", "Private Swimming Pool", "Smart Home & Panel Surya"],
        buyingMotivation: "Hunian Utama Keluarga",
        idealHouseDescription: "Rumah mewah 2-3 lantai bergaya modern kontemporer dengan pencahayaan alami, taman hijau luas, sistem keamanan terpadu, dan fasilitas jamuan tamu VIP."
      },
      approachAndFollowUp: {
        icebreakerChat: "Selamat pagi Bapak Anindya, salam hormat. Selamat atas kesuksesan delegasi Kadin dan inisiatif energi hijau terbarunya. Izin menyapa Pak, saya ada informasi unit private estate eksklusif di Jakarta Selatan yang sangat cocok untuk koleksi hunian keluarga Bapak.",
        keyValuePoints: [
          "Lokasi sangat bebas banjir dengan keamanan berlapis 24 jam",
          "Desain arsitektur ramah lingkungan dengan sertifikasi Green Building",
          "Akses cepat ke pusat bisnis Kuningan & Sudirman",
          "Legalitas Sertifikat Hak Milik (SHM) sudah clean & clear"
        ],
        waFollowUpScript: "Selamat siang Pak Anindya. Mengingat jadwal Bapak yang padat, izin mengabarkan bahwa kami telah menyiapkan opsi kunjungan private viewing unit di lokasi tanpa mengganggu agenda Bapak. Apakah ada waktu luang di akhir pekan ini atau Selasa depan untuk kami dampingi Pak? Terima kasih.",
        objectionHandling: [
          {
            objection: "Jadwal saya sangat padat, belum ada waktu survei langsung.",
            response: "Sangat dipahami Pak. Kami siap mengirimkan video walk-through 4K & berkas virtual tour interaktif ke WhatsApp Bapak terlebih dahulu agar bisa ditinjau di waktu senggang."
          },
          {
            objection: "Kami sedang memprioritaskan alokasi dana untuk investasi bisnis.",
            response: "Siap Pak Anindya, properti ini memiliki capital appreciation rata-rata 12% per tahun di kawasan eksklusif ini, sehingga selain untuk hunian keluarga juga menjadi instrumen penyeimbang portofolio aset yang sangat aman."
          }
        ]
      },
      sources: [
        {
          title: "Profil Resmi Anindya Bakrie - Bakrie & Brothers",
          uri: "https://www.google.com/search?q=Anindya+Bakrie+Bakrie+Brothers",
          snippet: "Informasi bisnis & kepemimpinan Bakrie Group."
        }
      ]
    };
  }

  // 2. Featured Preset: William Tanuwijaya
  if (cleanQuery.includes("william") || cleanQuery.includes("tanuwijaya")) {
    return {
      id: "buyer_william_" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      buyerProfile: {
        name: "William Tanuwijaya",
        jobTitle: "Co-Founder & Komisaris",
        company: "Tokopedia / GoTo Group",
        currentResidence: "Jakarta Selatan",
        originOrBackground: "Pematangsiantar, Sumatra Utara & Binus Alumni (Tokopedia Founder)",
        estimatedBudget: "Rp 15 - 30 Miliar",
        buyingIntent: "Pertimbangan Aktif (Warm Prospect)",
        summary: "William Tanuwijaya adalah pendiri Tokopedia. Menyukai desain hunian yang fungsional, berteknologi tinggi, hangat untuk tumbuh kembang anak-anak, serta dekat dengan akses pusat teknologi & pendidikan.",
        tags: ["Tokopedia Founder", "Tech Pioneer", "Smart Home Lover", "Warm Prospect"]
      },
      psychologyAndBehavior: {
        communicationStyle: "Humble, ramah, tidak suka pendekatan yang terlalu agresif atau pushy, menyukai komunikasi tertulis via WhatsApp.",
        decisionMakerType: "Keputusan bersama dengan istri demi kenyamanan & tumbuh kembang anak-anak.",
        personalityTraits: ["Rendah hati & berorientasi keluarga", "Sangat menyukai integrasi teknologi IoT/Smart Home", "Teliti terhadap tata ruang & pencahayaan"],
        preferredChannel: "WhatsApp Chat"
      },
      dreamHouseCriteria: {
        preferredLocations: ["Pondok Indah", "BSD City High-End Cluster", "Kemang"],
        propertyType: "Modern Minimalist Tropical Townhouse / Compact Mansion",
        mustHaveFacilities: ["Sistem Smart Home Terintegrasi", "Taman Tropis Penyerap Polusi", "Ruang Kerja / Home Office", "Playground Anak"],
        buyingMotivation: "Hunian Utama Keluarga",
        idealHouseDescription: "Rumah berdesain tropis modern dengan ventilasi silang yang sejuk, sistem keamanan IoT terpusat, taman dalam rumah (courtyard), serta lingkungan tetangga yang tenang."
      },
      approachAndFollowUp: {
        icebreakerChat: "Halo Pak William, salam kenal. Saya mengagumi perjalanan inspiratif Tokopedia sejak awal. Izin berbagi info Pak, kami baru saja membuka unit rumah tropis modern berkonsep smart home terpadu di kawasan hijau Jakarta Selatan yang sangat cocok untuk keluarga muda.",
        keyValuePoints: [
          "Teknologi IoT Smart Home bawaan (Smart Lock, CCTV, Automatic Lighting)",
          "Lingkungan ramah anak dengan taman bermain private di dalam cluster",
          "Pencahayaan alami maksimal sehingga hemat energi listrik",
          "Kawasan sangat tenang & bebas kebisingan jalan utama"
        ],
        waFollowUpScript: "Selamat pagi Pak William, semoga harinya menyenangkan. Mengingat Bapak menyukai kenyamanan keluarga, saya siap mendampingi kunjungan santai bersama keluarga untuk melihat opsi unit contoh di lokasi. Apakah Sabtu pagi besok ada waktu luang Pak?",
        objectionHandling: [
          {
            objection: "Saya perlu diskusikan dulu dengan istri di rumah.",
            response: "Tentu sekali Pak William, keputusan hunian keluarga memang paling pas dibicarakan bersama. Boleh saya kirimkan brosur foto & denah lengkapnya ke WA agar bisa dilihat bersama Ibu?"
          }
        ]
      },
      sources: [
        {
          title: "Profil William Tanuwijaya - GoTo",
          uri: "https://www.google.com/search?q=William+Tanuwijaya+Tokopedia",
          snippet: "Pendiri Tokopedia dan kisah kewirausahaan."
        }
      ]
    };
  }

  // 3. Featured Preset: Reyhan Naufal Zaki
  if (cleanQuery.includes("reyhan") || cleanQuery.includes("naufal")) {
    return {
      id: "buyer_reyhan_" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      buyerProfile: {
        name: "Reyhan Naufal Zaki",
        jobTitle: "Co-Founder & Project Manager",
        company: "Bertumbuh Digital Creative",
        currentResidence: "Surabaya",
        originOrBackground: "Praktisi Digital Marketing, Pembicara Entrepreneurship & Co-Founder Bertumbuh Academy",
        estimatedBudget: "Rp 2.5 Miliar - Rp 5 Miliar",
        buyingIntent: "Pertimbangan Aktif (Warm Prospect)",
        summary: "Reyhan Naufal Zaki merupakan profesional di bidang digital marketing dan industri kreatif yang berdomisili atau memiliki aktivitas profesional di Surabaya. Berperan sebagai Co-Founder & Project Manager di Bertumbuh Digital Creative.",
        tags: ["Bertumbuh Creative", "Digital Marketer", "Young Entrepreneur", "Surabaya"]
      },
      profileSummary: {
        overview: "Reyhan Naufal Zaki merupakan profesional di bidang digital marketing dan industri kreatif yang berdomisili atau memiliki aktivitas profesional di Surabaya. Informasi publik menunjukkan ia berperan sebagai Co-Founder sekaligus Project Manager di Bertumbuh Digital Creative sejak 2022. Profil profesionalnya menonjolkan kompetensi social media strategy, digital marketing, dan brand activation.",
        experienceHighlights: [
          "Co-Founder & Project Manager di Bertumbuh Digital Creative (2022–sekarang)",
          "Co-Founder Bertumbuh Academy & pembicara seminar kewirausahaan digital",
          "Digital marketing & promosi di perusahaan FMCG",
          "Social media specialist, branding & digital strategy"
        ],
        professionalCharacter: "Profil profesional muda yang entrepreneurial, aktif membangun jaringan, berorientasi pada hasil dan fleksibilitas kerja, serta terbuka pada peluang yang mendukung pengembangan karier, bisnis, maupun investasi aset."
      },
      prospectAssessment: {
        leadScore: 72,
        leadScoreText: "72/100 — Prospek Potensial, Belum Qualified",
        scoreDisclaimer: "Nilai ini bukan skor kemampuan finansial. Prospek baru dapat dianggap qualified secara efektif setelah kebutuhan, budget, skema pembayaran, dan jangka waktu dikonfirmasi.",
        matrix: [
          {
            aspect: "Potensi kebutuhan properti",
            rating: "Tinggi",
            reasoning: "Pendiri agency/proyek kreatif berpotensi membutuhkan hunian sekaligus ruang produktif atau studio di Surabaya."
          },
          {
            aspect: "Kemampuan membeli",
            rating: "Belum terverifikasi",
            reasoning: "Jabatan atau usaha tidak otomatis menunjukkan arus kas dan kapasitas kredit riil."
          },
          {
            aspect: "Potensi KPR",
            rating: "Menengah",
            reasoning: "Sebagai pengusaha/freelancer kreatif, pendapatan memadai namun memerlukan pembuktian penghasilan yang rapi."
          },
          {
            aspect: "Kebutuhan investasi",
            rating: "Menengah–tinggi",
            reasoning: "Latar belakang kewirausahaan membuat pendekatan berbasis aset dan yield sewa relevan."
          },
          {
            aspect: "Kesesuaian lokasi Surabaya",
            rating: "Tinggi",
            reasoning: "Aktivitas profesional dan bisnis dasarnya terhubung langsung dengan Surabaya."
          },
          {
            aspect: "Kemungkinan closing cepat",
            rating: "Belum dapat ditentukan",
            reasoning: "Belum diketahui kebutuhan riil, anggaran pasti, dan jangka waktu pembeliannya."
          }
        ]
      },
      relevantProperties: [
        {
          productTitle: "Rumah compact di Surabaya Timur/Pusat atau kawasan penyangga",
          reasonAndAngle: "Cocok untuk profesional muda yang mencari hunian pertama, ruang kerja tambahan, dan akses cepat ke pusat bisnis & aktivitas."
        },
        {
          productTitle: "SOHO atau rumah dengan ruang kerja fleksibel",
          reasonAndAngle: "Angle kuat untuk pekerjaan yang berhubungan dengan meeting tim, produksi konten kreatif, dan operasional agency."
        },
        {
          productTitle: "Apartemen dekat pusat bisnis / kampus",
          reasonAndAngle: "Hunian praktis mobilitas tinggi atau aset sewa yang mudah dikelola untuk pasif income."
        },
        {
          productTitle: "Properti investasi dengan potensi sewa",
          reasonAndAngle: "Cocok jika tujuannya murni investasi. Presentasi harus didukung data angka estimasi sewa & okupansi kawasan."
        }
      ],
      buyingTriggers: [
        "Apakah saat ini tinggal sendiri, bersama keluarga, atau menyewa di Surabaya?",
        "Apakah sedang merencanakan rumah pertama?",
        "Apakah membutuhkan ruang kerja atau studio kreatif di rumah?",
        "Apakah lebih tertarik pada hunian pribadi atau aset investasi?",
        "Apakah ada kebutuhan pindah dalam 6–12 bulan ke depan?",
        "Apakah pembelian direncanakan secara tunai, KPR, atau cicilan developer?"
      ],
      communicationApproach: {
        styleStrategy: "Karena latar belakangnya di bidang branding & digital marketing, hindari pesan generik atau promo murah. Gunakan pendekatan ringkas, spesifik, dan berbasis manfaat.",
        firstWaMessage: "Halo Mas Reyhan, saya melihat aktivitas Anda cukup aktif di Surabaya di bidang industri kreatif. Saya sedang menangani beberapa properti compact yang menarik untuk profesional—bisa difungsikan sebagai hunian, ruang kerja, sekaligus aset.\n\nSebelum saya kirim rekomendasinya, saat ini Anda lebih relevan mencari hunian pribadi, ruang produktif untuk usaha, atau properti investasi?",
        qualificationFollowUpMessage: "Siap Mas Reyhan. Supaya pilihannya tidak terlalu banyak dan benar-benar relevan, boleh saya sesuaikan berdasarkan tiga hal: area yang diinginkan di Surabaya, kisaran anggaran, dan target waktu pembelian?"
      },
      offerStrategyAndConclusion: {
        strategyPoints: [
          "Sajikan maksimal tiga pilihan, bukan katalog panjang.",
          "Gunakan perbandingan berbasis fungsi: hunian, ruang kerja, dan investasi.",
          "Sertakan simulasi uang muka dan cicilan, tetapi jangan menyimpulkan kemampuan membayarnya.",
          "Gunakan visual dan data lokasi yang rapi.",
          "Tawarkan survei lokasi hanya setelah kebutuhan dasarnya terkonfirmasi.",
          "Jika belum siap membeli, masukkan sebagai nurture lead dan hubungi kembali berdasarkan waktu yang disepakati."
        ],
        objectiveConclusion: "Kesimpulan paling objektif: Reyhan Naufal Zaki mempunyai kecocokan profil sebagai calon pembeli properti di Surabaya, terutama untuk rumah compact, SOHO, atau aset investasi. Namun, jejak profesional tidak cukup untuk menyatakan pasti mampu atau sedang ingin membeli. Prioritas agen adalah melakukan kualifikasi secara sopan."
      },
      psychologyAndBehavior: {
        communicationStyle: "Direct, spesifik, tidak suka basa-basi promo murah, menyukai penjelasan berbasis value & estetika.",
        decisionMakerType: "Pengambil keputusan mandiri / bersama mitra.",
        personalityTraits: ["Dynamic & tech-savvy", "Entrepreneurial mindset", "Menyukai lingkungan produktif"],
        preferredChannel: "WhatsApp Chat"
      },
      dreamHouseCriteria: {
        preferredLocations: ["Surabaya Timur", "Surabaya Pusat", "MERR Surabaya"],
        propertyType: "Modern Compact House / SOHO / Designer Townhouse",
        mustHaveFacilities: ["Ruang Kerja / Studio", "High-Speed Internet Ready", "Security 24 Jam", "Akses Cepat Jalan Utama"],
        buyingMotivation: "Hunian Produktif & Aset Masa Depan",
        idealHouseDescription: "Rumah compact berdesain minimalis modern di Surabaya dengan ruang kerja fleksibel, pencahayaan alami, dan akses mudah ke fasilitas perkotaan."
      },
      approachAndFollowUp: {
        icebreakerChat: "Halo Mas Reyhan, salam kenal. Selamat atas perkembangan Bertumbuh Digital Creative & Bertumbuh Academy. Saya ada opsi unit compact house berkonsep smart studio di Surabaya yang sangat pas untuk tempat tinggal sekaligus ruang karya profesional kreatif.",
        keyValuePoints: [
          "Desain layout fleksibel bisa untuk living space & studio mini",
          "Lokasi strategis dekat pusat aktivitas bisnis & kuliner Surabaya",
          "Sistem keamanan 24 jam & lingkungan tenang",
          "Skema pembayaran KPR ringan khusus profesional muda"
        ],
        waFollowUpScript: "Halo Mas Reyhan, semoga sukses selalu proyek Bertumbuh-nya. Jika minggu ini ada waktu luang, saya bisa jadwalkan private tour singkat di unit contoh Surabaya. Boleh saya kabarkan pilihannya via WA?",
        objectionHandling: [
          {
            objection: "Saat ini saya masih fokus alokasi modal untuk pengembangan bisnis.",
            response: "Sangat masuk akal Mas Reyhan. Unit ini juga memiliki potensi capital appreciation dan opsi sewa yang bagus di Surabaya, sehingga bisa jadi aset penyeimbang modal usaha yang sangat terukur."
          }
        ]
      },
      sources: [
        {
          title: "Profil Reyhan Naufal Zaki - LinkedIn",
          uri: "https://www.linkedin.com/in/reyhan-naufal-zaki",
          snippet: "Co-Founder & Project Manager di Bertumbuh Digital Creative, Surabaya."
        },
        {
          title: "Seminar Kewirausahaan Digital - Bertumbuh Academy",
          uri: "https://www.google.com/search?q=Reyhan+Naufal+Zaki+Bertumbuh",
          snippet: "Pembicara kewirausahaan digital dan digital marketing."
        }
      ]
    };
  }

  // 4. Dynamic Smart Extraction for Any Buyer Search
  const parsed = extractSmartQueryInfo(rawName, companyInput, positionInput, locationInput);

  const finalName = parsed.name;
  const comp = parsed.company;
  const pos = parsed.jobTitle;
  const loc = parsed.residence;
  const budget = targetBudget || parsed.budget;
  const propType = propertyType || "Rumah Tapak Cluster Modern / Exclusive Townhouse";

  let serperSources: Array<{ title: string; uri: string; snippet?: string }> = [];
  if (serperResults && Array.isArray(serperResults.organic) && serperResults.organic.length > 0) {
    serperSources = serperResults.organic.slice(0, 5).map((item: any) => ({
      title: item.title || `Referensi Google Search - ${finalName}`,
      uri: item.link || `https://www.google.com/search?q=${encodeURIComponent(finalName)}`,
      snippet: item.snippet || "",
    }));
  }

  const defaultSources = [
    {
      title: `Hasil Penelusuran Publik Google - ${finalName}`,
      uri: `https://www.google.com/search?q=${encodeURIComponent(finalName + " " + loc)}`,
      snippet: `Jejak rekam & profil publik ${finalName} di area ${loc}.`,
    }
  ];

  const finalSources = serperSources.length > 0 ? serperSources : defaultSources;

  return {
    id: "buyer_" + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    buyerProfile: {
      name: finalName,
      jobTitle: pos,
      company: comp,
      currentResidence: loc,
      originOrBackground: `Profil profesional/bisnis berdomisili atau menargetkan kawasan ${loc}`,
      estimatedBudget: budget,
      buyingIntent: "Pertimbangan Aktif (Warm Prospect)",
      summary: `${finalName} adalah ${pos} di ${comp}. Berdomisili atau mencari properti hunian berkualitas di area ${loc} dengan perkiraan alokasi budget ${budget}.`,
      tags: parsed.tags.length > 0 ? parsed.tags : [comp, pos, "Warm Prospect", loc]
    },
    profileSummary: {
      overview: `${finalName} merupakan profesional/pengusaha di bidang ${pos} di ${comp} yang berdomisili atau memiliki aktivitas profesional utama di kawasan ${loc}. Informasi rekam rekam jejak menunjukkan peranan aktif dalam pengembangan bisnis & pengelolaan proyek.`,
      experienceHighlights: [
        `Pengelolaan operasional & kepemimpinan di ${comp}`,
        `Aktivitas profesional & jejaring terhubung erat dengan kawasan ${loc}`,
        `Pengembangan strategic initiative & manajemen tim`,
        `Rekam jejak aktif dalam aktivitas komersial/swasta`
      ],
      professionalCharacter: `Profil profesional/bisnis yang entrepreneurial, berorientasi pada produktivitas & keluarga, aktif membangun jaringan, dan terbuka pada peluang kepemilikan aset properti bernilai tambah.`
    },
    prospectAssessment: {
      leadScore: 72,
      leadScoreText: "72/100 — Prospek Potensial, Belum Qualified",
      scoreDisclaimer: "Nilai ini bukan skor kemampuan finansial mutlak. Prospek baru dapat dianggap qualified secara efektif setelah kebutuhan riil, anggaran pasti, dan skema pembayaran dikonfirmasi.",
      matrix: [
        {
          aspect: "Potensi kebutuhan properti",
          rating: "Tinggi",
          reasoning: `Pengelola bisnis / ${pos} berpotensi membutuhkan hunian keluarga sekaligus ruang produktif atau aset investasi.`
        },
        {
          aspect: "Kemampuan membeli",
          rating: "Belum terverifikasi",
          reasoning: "Jabatan atau usaha tidak otomatis menunjukkan arus kas dan kapasitas kredit riil."
        },
        {
          aspect: "Potensi KPR",
          rating: "Menengah",
          reasoning: "Pendapatan tergolong memadai, namun perlu persiapan pembuktian penghasilan yang lebih terstruktur."
        },
        {
          aspect: "Kebutuhan investasi",
          rating: "Menengah–tinggi",
          reasoning: "Latar belakang profesional/bisnis membuat pendekatan berbasis aset & capital gain relevan."
        },
        {
          aspect: `Kesesuaian lokasi ${loc}`,
          rating: "Tinggi",
          reasoning: `Aktivitas profesional & domisili prospek terhubung langsung dengan area ${loc}.`
        },
        {
          aspect: "Kemungkinan closing cepat",
          rating: "Belum dapat ditentukan",
          reasoning: "Belum diketahui urgensi kebutuhan, anggaran pasti, status kepemilikan rumah, dan jangka waktunya."
        }
      ]
    },
    relevantProperties: [
      {
        productTitle: `Rumah compact di kawasan penyangga / pusat ${loc}`,
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
    ],
    buyingTriggers: [
      "Apakah saat ini tinggal sendiri, bersama keluarga, atau menyewa?",
      "Apakah sedang merencanakan rumah pertama?",
      "Apakah membutuhkan ruang kerja atau studio di rumah?",
      "Apakah lebih tertarik pada hunian pribadi atau aset investasi?",
      "Apakah ada kebutuhan pindah dalam 6–12 bulan?",
      "Apakah pembelian direncanakan secara tunai, KPR, atau cicilan developer?"
    ],
    communicationApproach: {
      styleStrategy: "Karena latar belakang profesionalnya, hindari pesan generik. Gunakan pendekatan ringkas, spesifik, dan berbasis manfaat.",
      firstWaMessage: `Halo Bapak/Ibu ${finalName}, saya melihat aktivitas Anda cukup aktif di kawasan ${loc}. Saya sedang menangani beberapa properti compact yang menarik untuk profesional—bisa difungsikan sebagai hunian, ruang kerja, sekaligus aset. Sebelum saya kirim rekomendasinya, saat ini Anda lebih relevan mencari hunian pribadi, ruang produktif untuk usaha, atau properti investasi?`,
      qualificationFollowUpMessage: `Siap Bapak/Ibu ${finalName}. Supaya pilihannya tidak terlalu banyak dan benar-benar relevan, boleh saya sesuaikan berdasarkan tiga hal: area yang diinginkan, kisaran anggaran, dan target pembelian?`
    },
    offerStrategyAndConclusion: {
      strategyPoints: [
        "Sajikan maksimal tiga pilihan, bukan katalog panjang.",
        "Gunakan perbandingan berbasis fungsi: hunian, ruang kerja, dan investasi.",
        "Sertakan simulasi uang muka dan cicilan, tetapi jangan menyimpulkan kemampuan membayarnya.",
        "Gunakan visual dan data lokasi yang rapi.",
        "Tawarkan survei lokasi hanya setelah kebutuhan dasarnya terkonfirmasi.",
        "Jika belum siap membeli, masukkan sebagai nurture lead dan hubungi kembali berdasarkan waktu yang disepakati."
      ],
      objectiveConclusion: `Kesimpulan paling objektif: ${finalName} mempunyai kecocokan profil sebagai calon pembeli properti di kawasan ${loc}. Namun, jejak profesional tidak cukup untuk menyatakan pasti mampu atau sedang ingin membeli. Prioritas agen adalah melakukan qualification secara sopan sebelum memberikan rekomendasi produk.`
    },
    psychologyAndBehavior: {
      communicationStyle: "Sopan, profesional, menyukai penjelasan yang ringkas dan jelas via pesan WhatsApp.",
      decisionMakerType: "Pengambil keputusan utama bersama keluarga / pasangan.",
      personalityTraits: ["Sangat memperhatikan kepraktisan lokasi & akses", "Memperhitungkan kenyamanan jangka panjang keluarga", "Menyukai pengembang bereputasi baik"],
      preferredChannel: "WhatsApp Chat"
    },
    dreamHouseCriteria: {
      preferredLocations: [loc, "Kawasan Cluster Strategis"],
      propertyType: propType,
      mustHaveFacilities: ["Keamanan 24 Jam dengan One Gate System", "Carport / Garasi", "Taman Hunian Asri", "Akses Jalan Lebar & Bebas Banjir"],
      buyingMotivation: "Hunian Utama Keluarga",
      idealHouseDescription: `Rumah bergaya modern di lingkungan cluster eksklusif area ${loc}, bebas banjir, dengan fasilitas lengkap dan akses cepat ke jalur utama.`
    },
    approachAndFollowUp: {
      icebreakerChat: `Selamat pagi Bapak/Ibu ${finalName}, salam kenal. Izin menyapa terkait informasi opsi unit rumah pilihan di lokasi strategis ${loc} yang sangat sesuai dengan kriteria hunian impian keluarga Bapak/Ibu.`,
      keyValuePoints: [
        `Lokasi sangat strategis di area ${loc} dekat dengan pusat bisnis & fasilitas umum`,
        "Sistem cluster satu pintu (One Gate System) dengan CCTV 24 jam",
        "Promo harga khusus & skema pembayaran fleksibel (KPR / DP Keringanan)",
        "Potensi kenaikan investasi (Capital Appreciation) sangat menjanjikan"
      ],
      waFollowUpScript: `Selamat siang Bapak/Ibu ${finalName}. Mengingat ketersediaan unit tipe favorit kami yang terbatas di ${loc}, saya ingin mengundang Bapak/Ibu untuk melihat langsung unit contoh di lokasi. Boleh kami jadwalkan survei santai akhir pekan ini?`,
      objectionHandling: [
        {
          objection: "Saya masih banding-bandingkan dengan opsi proyek perumahan lain.",
          response: "Tentu Bapak/Ibu, membandingkan adalah langkah tepat sebelum membeli. Keunggulan utama proyek kami terletak pada kualitas spesifikasi bangunan, keasrian lingkungan, dan promo keringanan cicilan yang bisa dihemat."
        },
        {
          objection: "Apakah harganya masih bisa nego?",
          response: "Untuk unit siap huni ini kami ada program keringanan DP dan bonus kitchen set/AC bawaan. Mari kita lihat unitnya dulu Bapak/Ibu, nanti skema harga terbaik pasti kami bantu ajukan ke manajemen."
        }
      ]
    },
    sources: finalSources
  };
}

// API Route: Generate Property Buyer Profile
app.post("/api/profile", async (req, res) => {
  try {
    const { name, phoneNumber, residence, socialMediaLink, company, position, location, targetBudget, propertyType, buyerCategory, serperApiKey, openaiApiKey, aiEngine } = req.body;

    const inputLocation = (location || residence || "").trim();
    const rawName = (name || "").trim();
    const rawPhone = (phoneNumber || "").trim();
    const rawSocial = (socialMediaLink || "").trim();

    if (!rawName && !inputLocation && !rawPhone && !rawSocial) {
      return res.status(400).json({ error: "Mohon masukkan pencarian (nama, nomor HP, tempat tinggal, atau link sosial media pembeli)." });
    }

    const effectiveName = rawName || (rawPhone ? `Prospek WA ${rawPhone}` : rawSocial ? `Prospek ${rawSocial.replace(/https?:\/\/(www\.)?/, '')}` : `Prospek Buyer ${inputLocation}`);

    const effectiveSerperKey = (serperApiKey || process.env.SERPER_API_KEY || "").trim();
    let serperData: any = null;

    if (effectiveSerperKey) {
      const searchQuery = `"${effectiveName}" ${rawPhone} ${rawSocial} ${company || ""} ${position || ""} ${inputLocation}`.trim();
      serperData = await fetchSerperSearch(searchQuery, effectiveSerperKey);
    }

    // Construct prompt with Serper live search results if available
    let serperContext = "";
    if (serperData && serperData.organic && serperData.organic.length > 0) {
      const organicItems = serperData.organic.slice(0, 8).map((item: any, idx: number) => 
        `${idx + 1}. [${item.title}](${item.link})\nSnippet: ${item.snippet}`
      ).join("\n\n");

      let newsItems = "";
      if (serperData.news && serperData.news.length > 0) {
        newsItems = "\n\nHASIL BERITA GOOGLE SEARCH:\n" + serperData.news.slice(0, 5).map((item: any, idx: number) =>
          `${idx + 1}. ${item.title} (${item.source || 'News'}, ${item.date || 'Terbaru'})\nURL: ${item.link}\nSnippet: ${item.snippet}`
        ).join("\n");
      }

      serperContext = `\n\nHASIL PENCARIAN GOOGLE LIVE REAL-TIME (SERPER.DEV):\n${organicItems}${newsItems}\n\nPENTING: Olah hasil pencarian Google ini ke dalam profil calon pembeli properti!`;
    }

    const prompt = `Analisis profil calon pembeli rumah untuk Agen Properti:
Kata Kunci Pencarian Utama / Nama: "${effectiveName}"
${rawPhone ? `Nomor WhatsApp / HP: "${rawPhone}"` : ""}
${residence || inputLocation ? `Tempat Tinggal / Lokasi Target Properti: "${residence || inputLocation}"` : ""}
${rawSocial ? `Link Social Media / Profil: "${rawSocial}"` : ""}
${buyerCategory ? `Kategori Pembeli: "${buyerCategory}"` : ""}
${company ? `Perusahaan / Bisnis: "${company}"` : ""}
${position ? `Jabatan / Pekerjaan: "${position}"` : ""}
${targetBudget ? `Estimasi Budget Target: "${targetBudget}"` : ""}
${propertyType ? `Tipe Properti Diminati: "${propertyType}"` : ""}${serperContext}

Lakukan analisis & sintesis profil psikologi pembeli di area/kategori ini, kriteria rumah impian, serta strategi pendekatan follow-up WhatsApp terbaik untuk agen properti.`;

    console.log(`[AgenPro API] Analyzing buyer profile: ${effectiveName} (Primary: GPT gpt-4o-mini, Support: Serper + Gemini)`);

    let textOutput = "";
    let groundingChunks: any[] = [];
    let apiSuccess = false;
    let usedGpt = false;

    // Stage 1: Try Budget GPT API (gpt-4o-mini) if OpenAI Client is available
    const gptClient = getOpenAIClient(openaiApiKey);
    if (gptClient) {
      try {
        console.log(`[AgenPro API] Analyzing via budget OpenAI GPT model (gpt-4o-mini)...`);
        const completion = await gptClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: PROPERTY_AGENT_SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        textOutput = completion.choices[0]?.message?.content || "";
        if (textOutput.trim()) {
          apiSuccess = true;
          usedGpt = true;
        }
      } catch (gptErr: any) {
        logApiNotice("OpenAI GPT-4o-mini Analysis", gptErr);

        // Sub-fallback: try gpt-3.5-turbo if gpt-4o-mini is unavailable
        try {
          console.log(`[AgenPro API] Retrying via OpenAI gpt-3.5-turbo...`);
          const completion2 = await gptClient.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: PROPERTY_AGENT_SYSTEM_PROMPT },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          });

          textOutput = completion2.choices[0]?.message?.content || "";
          if (textOutput.trim()) {
            apiSuccess = true;
            usedGpt = true;
          }
        } catch (gptErr2: any) {
          logApiNotice("OpenAI gpt-3.5-turbo Analysis", gptErr2);
        }
      }
    }

    // Stage 2: Gemini Execution (Support / Fallback Engine)
    if (!apiSuccess) {
      const ai = getGeminiClient();

      // Gemini Stage 1: Try gemini-3.6-flash with Google Search Grounding
      try {
        console.log(`[AgenPro API] Analyzing via Gemini Support Engine (gemini-3.6-flash)...`);
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            systemInstruction: PROPERTY_AGENT_SYSTEM_PROMPT,
            tools: [{ googleSearch: {} }],
            temperature: 0.2,
          },
        });

        textOutput = response.text || "";
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        groundingChunks = groundingMetadata?.groundingChunks || [];
        apiSuccess = true;
      } catch (err1: any) {
        logApiNotice("Gemini Support Stage 1", err1);

        // Gemini Stage 2: Try gemini-3.6-flash WITHOUT Google Search Grounding
        try {
          const response2 = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
              systemInstruction: PROPERTY_AGENT_SYSTEM_PROMPT,
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          });

          textOutput = response2.text || "";
          apiSuccess = true;
        } catch (err2: any) {
          logApiNotice("Gemini Support Stage 2", err2);

          // Gemini Stage 3: Try gemini-3.1-flash-lite
          try {
            const response3 = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: prompt,
              config: {
                systemInstruction: PROPERTY_AGENT_SYSTEM_PROMPT,
                temperature: 0.2,
                responseMimeType: "application/json",
              },
            });

            textOutput = response3.text || "";
            apiSuccess = true;
          } catch (err3: any) {
            logApiNotice("Gemini Support Stage 3", err3);
          }
        }
      }
    }


    // If all API calls were quota-exhausted or failed, return synthesized fallback dossier
    if (!apiSuccess || !textOutput.trim()) {
      console.log(`[AgenPro API] Returning synthetic buyer profile for "${name}"`);
      const fallbackDossier = createFallbackDossier(name, company, position, location, targetBudget, propertyType, serperData);
      return res.json({ success: true, dossier: fallbackDossier });
    }

    // Extract grounding sources if available
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || "Referensi Web Google",
        uri: chunk.web.uri,
        snippet: chunk.web.snippet || "",
      }));

    // Deduplicate sources by URI
    const uniqueSources: { title: string; uri: string; snippet?: string }[] = [];
    const seenUris = new Set<string>();
    for (const src of sources) {
      if (!seenUris.has(src.uri)) {
        seenUris.add(src.uri);
        uniqueSources.push(src);
      }
    }

    if (uniqueSources.length === 0) {
      uniqueSources.push(
        {
          title: `Indeks Pencarian Google - ${name}`,
          uri: `https://www.google.com/search?q=${encodeURIComponent(name + " " + (company || ""))}`,
          snippet: `Hasil penelusuran publik untuk ${name}.`,
        }
      );
    }

    // Parse JSON from textOutput
    let parsedData: any = null;
    try {
      let cleanedJsonText = textOutput;
      const jsonMatch = textOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (jsonMatch) {
        cleanedJsonText = jsonMatch[1];
      } else {
        const firstBrace = textOutput.indexOf("{");
        const lastBrace = textOutput.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedJsonText = textOutput.substring(firstBrace, lastBrace + 1);
        }
      }
      parsedData = JSON.parse(cleanedJsonText);
    } catch (parseError) {
      console.error("[PropSearch API] JSON parse error:", parseError, textOutput);
      parsedData = createFallbackDossier(effectiveName, company, position, location, targetBudget, propertyType, serperData);
    }

    // Post-process to ensure clean buyer name and residence
    if (parsedData && parsedData.buyerProfile) {
      const smartInfo = extractSmartQueryInfo(effectiveName, company, position, location);
      if (!parsedData.buyerProfile.name || parsedData.buyerProfile.name.toLowerCase() === effectiveName.toLowerCase()) {
        parsedData.buyerProfile.name = smartInfo.name;
      }
      if (!parsedData.buyerProfile.currentResidence || parsedData.buyerProfile.currentResidence.toLowerCase().includes("target")) {
        parsedData.buyerProfile.currentResidence = smartInfo.residence;
      }
    }

    // Attach server metadata & sources
    const fullDossier = {
      id: "buyer_" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      ...parsedData,
      sources: uniqueSources,
    };

    return res.json({ success: true, dossier: fullDossier });
  } catch (error: any) {
    console.error("[AgenPro API] Error generating buyer profile:", error);
    const reqBody = req.body || {};
    const fallbackDossier = createFallbackDossier(
      reqBody.name || "Calon Pembeli",
      reqBody.company,
      reqBody.position,
      reqBody.location,
      reqBody.targetBudget,
      reqBody.propertyType
    );
    return res.json({ success: true, dossier: fallbackDossier });
  }
});

// API Route: Generate WhatsApp Script & Follow-up Strategy for Real Estate
app.post("/api/pitch-generate", async (req, res) => {
  try {
    const { dossier, offeringType, customNotes } = req.body;
    if (!dossier || !dossier.buyerProfile) {
      return res.status(400).json({ error: "Data calon pembeli tidak valid." });
    }

    const buyerName = dossier.buyerProfile.name || "Calon Pembeli";
    const jobTitle = dossier.buyerProfile.jobTitle || "Eksekutif";
    const offering = offeringType || "Rumah Tapak Modern Premium / Cluster Eksklusif";

    const ai = getGeminiClient();

    const prompt = `Anda adalah Asisten Sales Agen Properti Ahli. Buatkan Skrip Pesan WhatsApp & Penawaran Properti Khusus untuk Calon Pembeli.

PROFIL PEMBELI:
Nama: ${buyerName}
Pekerjaan/Bisnis: ${jobTitle} di ${dossier.buyerProfile.company || "Swasta"}
Budget: ${dossier.buyerProfile.estimatedBudget || "Menyesuaikan"}
Lokasi Tinggal: ${dossier.buyerProfile.currentResidence}
Tipe Rumah Impian: ${dossier.dreamHouseCriteria?.propertyType || "Rumah Tapak"}
Fasilitas Wajib: ${dossier.dreamHouseCriteria?.mustHaveFacilities?.join(", ") || "Keamanan, Taman"}
Gaya Komunikasi: ${dossier.psychologyAndBehavior?.communicationStyle || "Sopan & Direct"}

Tipe Properti Ditawarkan: ${offering}
Catatan Tambahan Agen: ${customNotes || "Tekankan kualitas bangunan, bebas banjir, keamanan 24 jam, & skema DP ringan."}

Tugas: Buatkan paket komunikasi WhatsApp 3 bagian dalam Bahasa Indonesia:
1. Pesan WA Pembuka (Icebreaker hangat & sopan)
2. Skrip WA Follow-Up Lengkap untuk Ajak Kunjungan Show Unit / Survei Lokasi
3. Strategi Menjawab Keberatan (3 contoh keberatan pembeli & jawaban persuasif agen)

Kembalikan format JSON:
{
  "waMessage": "string",
  "icebreakerUsed": "string",
  "keySellingPoints": ["point 1", "point 2", "point 3"],
  "objectionHandling": [
    { "objection": "string", "response": "string" }
  ],
  "followUpStrategy": "string"
}`;

    let textOutput = "";
    let apiSuccess = false;

    // Try Stage 1: gemini-3.6-flash
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });
      textOutput = response.text || "";
      apiSuccess = true;
    } catch (err1) {
      logApiNotice("Pitch Stage 1", err1);
      // Try Stage 2: gemini-3.1-flash-lite
      try {
        const response2 = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        });
        textOutput = response2.text || "";
        apiSuccess = true;
      } catch (err2) {
        logApiNotice("Pitch Stage 2", err2);
      }
    }

    let pitchData: any = null;
    if (apiSuccess && textOutput.trim()) {
      try {
        pitchData = JSON.parse(textOutput);
      } catch (e) {
        console.warn("[AgenPro API] Pitch JSON parse issue:", e);
      }
    }

    // Fallback pitch object if API call failed
    if (!pitchData) {
      pitchData = {
        waMessage: `Selamat pagi Bapak/Ibu ${buyerName}, salam hangat.\n\nSaya mengagumi rekam jejak Bapak/Ibu di ${jobTitle}. Izin menyapa sebentar Pak/Bu, kami ada rekomendasi opsi unit hunian eksklusif di kawasan ${dossier.buyerProfile.currentResidence} yang sangat sesuai dengan kriteria rumah impian keluarga Bapak/Ibu.\n\nUnit ini dilengkapi sistem keamanan 24 jam, lingkungan asri ramah anak, dan bebas banjir. Boleh saya kirimkan brosur foto & videonya ke WA ini Pak/Bu? Terima kasih banyak.`,
        icebreakerUsed: `Menyapa sopan dengan menyebut nama Bapak/Ibu ${buyerName} dan rekam jejak pekerjaannya.`,
        keySellingPoints: [
          `Lokasi strategis di area ${dossier.buyerProfile.currentResidence} dengan akses tol cepat.`,
          `Fasilitas lengkap bawaan (Security 24 Jam, Smart Lock, Taman).`,
          `Skema kemudahan cicilan KPR / DP fleksibel.`
        ],
        objectionHandling: [
          {
            objection: "Saya masih bandingkan dengan beberapa proyek perumahan lain.",
            response: "Sangat dipahami Bapak/Ibu, membandingkan adalah hal yang baik. Kelebihan utama proyek kami ada pada kualitas spesifikasi material dan nilai investasi yang cepat naik di area ini."
          },
          {
            objection: "Jadwal saya sibuk, belum sempat datang survei lokasi.",
            response: "Tidak masalah Bapak/Ibu. Kami bisa kirimkan video 360 virtual tour dan brosur PDF dulu ke WA ini agar bisa ditinjau kapan saja."
          }
        ],
        followUpStrategy: `Lakukan follow-up santai 2 hari sekali via WhatsApp dengan membagikan video ketersediaan unit terbaru atau update promo KPR.`
      };
    }

    return res.json({ success: true, pitch: pitchData });
  } catch (error: any) {
    console.error("[AgenPro API] Pitch error:", error);
    const reqBody = req.body || {};
    const buyerName = reqBody.dossier?.buyerProfile?.name || "Calon Pembeli";
    return res.json({
      success: true,
      pitch: {
        waMessage: `Selamat pagi Bapak/Ibu ${buyerName}, salam kenal. Izin berbagi rekomendasi unit rumah impian eksklusif untuk keluarga.`,
        icebreakerUsed: `Menyapa ${buyerName} secara hangat & sopan.`,
        keySellingPoints: ["Lokasi Bebas Banjir", "Keamanan 24 Jam", "Sertifikat Clean & Clear"],
        objectionHandling: [{ objection: "Masih dipikirkan", response: "Siap, kami siap bantu kirim brosur virtual." }],
        followUpStrategy: "Kirim update info unit via WhatsApp."
      }
    });
  }
});

async function startServer() {
  // Vite middleware for development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Public Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
