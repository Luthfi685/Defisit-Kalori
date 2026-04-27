import { Injectable } from '@angular/core';
import { UserProfile, FoodLog, DailySummary, CommunityPost, Comment } from '../models/models';

const KEYS = {
  PROFILE: 'kf_profile',
  FOOD_LOGS: 'kf_food_logs',
  DAILY_SUMMARIES: 'kf_daily_summaries',
  COMMUNITY_POSTS: 'kf_community_posts',
  BODY_WEIGHT: 'kf_body_weight',
  COMMENTS: 'kf_comments',
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // ========================
  // USER PROFILE
  // ========================
  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }

  getProfile(): UserProfile | null {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  }

  clearProfile(): void {
    localStorage.removeItem(KEYS.PROFILE);
  }

  // ========================
  // FOOD LOGS
  // ========================
  saveFoodLog(log: FoodLog): void {
    const logs = this.getAllFoodLogs();
    logs.push(log);
    localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(logs));
    this.updateDailySummary(log.tanggal);
  }

  getAllFoodLogs(): FoodLog[] {
    const data = localStorage.getItem(KEYS.FOOD_LOGS);
    return data ? JSON.parse(data) : [];
  }

  getFoodLogsByDate(tanggal: string): FoodLog[] {
    return this.getAllFoodLogs().filter(log => log.tanggal === tanggal);
  }

  deleteFoodLog(id: string, tanggal: string): void {
    const logs = this.getAllFoodLogs().filter(log => log.id !== id);
    localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(logs));
    this.updateDailySummary(tanggal);
  }

  // ========================
  // DAILY SUMMARIES
  // ========================
  private updateDailySummary(tanggal: string): void {
    const logs = this.getFoodLogsByDate(tanggal);
    const summaries = this.getAllDailySummaries();

    const existing = summaries.find(s => s.tanggal === tanggal);
    const summary: DailySummary = {
      tanggal,
      totalKalori: logs.reduce((a, l) => a + l.kalori, 0),
      totalProtein: logs.reduce((a, l) => a + l.protein, 0),
      totalLemak: logs.reduce((a, l) => a + l.lemak, 0),
      totalKarbo: logs.reduce((a, l) => a + l.karbo, 0),
      totalSerat: logs.reduce((a, l) => a + l.serat, 0),
      totalKalsium: logs.reduce((a, l) => a + l.kalsium, 0),
      totalBesi: logs.reduce((a, l) => a + l.besi, 0),
      beratBadan: existing?.beratBadan,
    };

    if (existing) {
      const idx = summaries.indexOf(existing);
      summaries[idx] = summary;
    } else {
      summaries.push(summary);
    }
    localStorage.setItem(KEYS.DAILY_SUMMARIES, JSON.stringify(summaries));
  }

  getAllDailySummaries(): DailySummary[] {
    const data = localStorage.getItem(KEYS.DAILY_SUMMARIES);
    return data ? JSON.parse(data) : [];
  }

  getDailySummary(tanggal: string): DailySummary | null {
    return this.getAllDailySummaries().find(s => s.tanggal === tanggal) || null;
  }

  saveBodyWeight(tanggal: string, berat: number): void {
    const summaries = this.getAllDailySummaries();
    const existing = summaries.find(s => s.tanggal === tanggal);
    if (existing) {
      existing.beratBadan = berat;
    } else {
      summaries.push({
        tanggal, totalKalori: 0, totalProtein: 0, totalLemak: 0,
        totalKarbo: 0, totalSerat: 0, totalKalsium: 0, totalBesi: 0,
        beratBadan: berat
      });
    }
    localStorage.setItem(KEYS.DAILY_SUMMARIES, JSON.stringify(summaries));
  }

  getRecentSummaries(days: number): DailySummary[] {
    const summaries = this.getAllDailySummaries();
    const sorted = summaries.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    return sorted.slice(-days);
  }

  // ========================
  // COMMUNITY POSTS
  // ========================
  initCommunityPosts(): void {
    const existing = localStorage.getItem(KEYS.COMMUNITY_POSTS);
    if (!existing) {
      const defaultPosts: CommunityPost[] = [
        {
          id: '1', judul: 'Tips Diet Defisit Kalori yang Aman',
          isi: 'Defisit kalori yang ideal adalah 300-500 kkal per hari. Jangan terlalu ekstrem ya! Pastikan tetap makan protein yang cukup supaya massa otot terjaga.',
          kategori: 'tips', penulis: 'Admin', tanggal: '2026-01-10', likes: 42, emoji: ''
        },
        {
          id: '2', judul: 'Berhasil Turun 5kg dalam 2 Bulan!',
          isi: 'Alhamdulillah akhirnya goal tercapai! Kuncinya konsisten tracking kalori setiap hari dan olahraga cardio 3x seminggu. Semangat terus semuanya!',
          kategori: 'pencapaian', penulis: 'Sari Dewi', tanggal: '2026-01-15', likes: 128, emoji: ''
        },
        {
          id: '3', judul: 'Resep Salad Ayam Rendah Kalori',
          isi: 'Bahan: dada ayam rebus 150g, selada, tomat, timun, dress dengan lemon + olive oil sedikit. Total sekitar 250 kkal, tinggi protein 35g! Enak dan mengenyangkan.',
          kategori: 'resep', penulis: 'Chef Rian', tanggal: '2026-01-18', likes: 67, emoji: ''
        },
        {
          id: '4', judul: 'Motivasi Pagi: Mulai Dari Diri Sendiri',
          isi: 'Body goals itu bukan tentang jadi seperti orang lain, tapi tentang versi terbaik dirimu sendiri. Setiap langkah kecil itu berarti. Semangat!',
          kategori: 'motivasi', penulis: 'Coach Budi', tanggal: '2026-01-20', likes: 95, emoji: ''
        },
        {
          id: '5', judul: 'Pentingnya Minum Air Putih Saat Diet',
          isi: 'Minum 2-3 liter air putih per hari bisa bantu kontrol nafsu makan, percepat metabolisme, dan bantu pembuangan lemak. Jangan sampai dehidrasi!',
          kategori: 'tips', penulis: 'Dr. Nutrition', tanggal: '2026-01-22', likes: 53, emoji: ''
        },
        {
          id: '6', judul: 'Challenge 30 Hari Tanpa Gorengan!',
          isi: 'Siapa mau ikut challenge 30 hari tanpa makan gorengan? Gorengan itu musuh diet kita karena tinggi lemak jenuh. Yuk buktikan kita bisa!',
          kategori: 'motivasi', penulis: 'Fitria K', tanggal: '2026-01-25', likes: 74, emoji: ''
        }
      ];
      localStorage.setItem(KEYS.COMMUNITY_POSTS, JSON.stringify(defaultPosts));
    }
  }

  getCommunityPosts(): CommunityPost[] {
    const data = localStorage.getItem(KEYS.COMMUNITY_POSTS);
    return data ? JSON.parse(data) : [];
  }

  addCommunityPost(post: CommunityPost): void {
    const posts = this.getCommunityPosts();
    posts.unshift(post);
    localStorage.setItem(KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
  }

  toggleLike(postId: string): void {
    const posts = this.getCommunityPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      if (post.isLiked) {
        post.likes--;
        post.isLiked = false;
      } else {
        post.likes++;
        post.isLiked = true;
      }
      localStorage.setItem(KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
    }
  }

  // ========================
  // COMMENTS
  // ========================
  getAllComments(): Comment[] {
    const data = localStorage.getItem(KEYS.COMMENTS);
    return data ? JSON.parse(data) : [];
  }

  getCommentsByPost(postId: string): Comment[] {
    return this.getAllComments().filter(c => c.postId === postId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  addComment(comment: Comment): void {
    const comments = this.getAllComments();
    comments.push(comment);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
  }

  deleteComment(commentId: string): void {
    const comments = this.getAllComments().filter(c => c.id !== commentId);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
  }

  getCommentCount(postId: string): number {
    return this.getCommentsByPost(postId).length;
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  clearAll(): void {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }
}
