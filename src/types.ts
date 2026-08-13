export interface ProfileSearchRequest {
  name: string;
  phoneNumber?: string;
  residence?: string;
  socialMediaLink?: string;
  location?: string;
  targetBudget?: string;
  propertyType?: string;
  buyerCategory?: string;
  company?: string;
  position?: string;
  serperApiKey?: string;
  openaiApiKey?: string;
  aiEngine?: 'gemini' | 'gpt';
}


export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
}

export interface AssessmentAspect {
  aspect: string;
  rating: string;
  reasoning: string;
}

export interface RelevantPropertyOption {
  productTitle: string;
  reasonAndAngle: string;
}

export interface PropertyBuyerDossier {
  id: string;
  createdAt: string;
  buyerProfile: {
    name: string;
    jobTitle: string;
    company: string;
    currentResidence: string; // Dimana tinggal sekarang
    originOrBackground: string; // Asal/latar belakang orang mana/budaya
    estimatedBudget: string; // Estimasi budget rumah
    buyingIntent: 'Sangat Siap Beli (Hot Prospect)' | 'Pertimbangan Aktif (Warm Prospect)' | 'Eksplorasi (Cold Prospect)';
    summary: string;
    tags: string[];
  };

  // Section 1: Ringkasan Profil
  profileSummary?: {
    overview: string;
    experienceHighlights: string[];
    professionalCharacter: string;
  };

  // Section 2: Penilaian Penjualan / Assessment Matrix
  prospectAssessment?: {
    leadScore: number;
    leadScoreText: string;
    scoreDisclaimer: string;
    matrix: AssessmentAspect[];
  };

  // Section 3: Properti Relevan
  relevantProperties?: RelevantPropertyOption[];

  // Section 4: Buying Trigger yang Perlu Digali
  buyingTriggers?: string[];

  // Section 5: Pendekatan Komunikasi & WA
  communicationApproach?: {
    styleStrategy: string;
    firstWaMessage: string;
    qualificationFollowUpMessage: string;
  };

  // Section 6: Strategi Penawaran & Kesimpulan Objektif
  offerStrategyAndConclusion?: {
    strategyPoints: string[];
    objectiveConclusion: string;
  };

  psychologyAndBehavior: {
    communicationStyle: string; // Gaya komunikasi yang disukai
    decisionMakerType: string; // Karakter pengambil keputusan (sendiri/pasangan/keluarga besar)
    personalityTraits: string[];
    preferredChannel: 'WhatsApp Chat' | 'Telepon Direct' | 'Kunjungan Show Unit';
  };
  dreamHouseCriteria: {
    preferredLocations: string[]; // Lokasi impian
    propertyType: string; // Rumah tapak, villa, townhouse, dll
    mustHaveFacilities: string[]; // Kolam renang, taman, keamanan 24 jam, dll
    buyingMotivation: 'Hunian Utama Keluarga' | 'Investasi / Yield Sewa' | 'Rumah Peristirahatan / Villa';
    idealHouseDescription: string; // Gambaran spesifik rumah impiannya
  };
  approachAndFollowUp: {
    icebreakerChat: string; // Obrolan pembuka yang hangat & personal
    keyValuePoints: string[]; // Poin penawaran yang paling efektif
    waFollowUpScript: string; // Skrip WhatsApp lengkap untuk ajak survei/show unit
    objectionHandling: {
      objection: string;
      response: string;
    }[];
  };
  sources: GroundingSource[];
}

export interface PresetTarget {
  name: string;
  company: string;
  position: string;
  location: string;
  budget?: string;
  targetBudget?: string;
  propertyType?: string;
  category: string;
  avatar: string;
  description: string;
}

