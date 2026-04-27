export interface UserProfile {
  nama: string;
  umur: number;
  gender: 'pria' | 'wanita';
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  levelAktivitas: number; // 1.2 - 1.9
  targetDefisit: number; // kkal defisit per hari
  bmr: number;
  tdee: number;
  targetKalori: number;
  targetProtein: number;
  targetLemak: number;
  targetKarbo: number;
  // Mikro
  targetSerat: number;   // g/hari (rekomendasi: 25-38g)
  targetKalsium: number; // mg/hari (rekomendasi: 1000mg)
  targetBesi: number;    // mg/hari (pria: 8mg, wanita: 18mg)
  tanggalMulai: string;
  beratTarget: number;
}

export interface FoodItem {
  id: string | number;
  nama: string;
  kalori: number;
  protein: number;
  lemak: number;
  karbo: number;
  serat: number;
  kalsium: number;
  besi: number;
  brand?: string;
  image?: string;
  isCustom?: boolean;
}

export interface FoodLog {
  id: string;
  foodId: string | number;
  nama: string;
  waktu: 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan';
  porsi: number; // multiplier
  kalori: number;
  protein: number;
  lemak: number;
  karbo: number;
  serat: number;
  kalsium: number;
  besi: number;
  tanggal: string; // YYYY-MM-DD
  timestamp: number;
  image?: string;
}

export interface DailySummary {
  tanggal: string; // YYYY-MM-DD
  totalKalori: number;
  totalProtein: number;
  totalLemak: number;
  totalKarbo: number;
  totalSerat: number;
  totalKalsium: number;
  totalBesi: number;
  beratBadan?: number;
}

export interface Comment {
  id: string;
  postId: string;
  penulis: string;
  isi: string;
  tanggal: string;
  timestamp: number;
}

export interface CommunityPost {
  id: string;
  judul: string;
  isi: string;
  kategori: 'tips' | 'motivasi' | 'pencapaian' | 'resep';
  penulis: string;
  tanggal: string;
  likes: number;
  isLiked?: boolean;
  emoji: string;
  comments?: Comment[];
}
