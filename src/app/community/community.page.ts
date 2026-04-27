import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { CommunityPost, Comment } from '../models/models';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CommunityPage implements OnInit {
  posts: CommunityPost[] = [];
  activeFilter: 'semua' | 'tips' | 'motivasi' | 'pencapaian' | 'resep' = 'semua';
  showAddForm = false;

  // Komentar
  expandedPostId: string | null = null;
  commentsMap: { [postId: string]: Comment[] } = {};
  newCommentText: { [postId: string]: string } = {};

  newPost = {
    judul: '',
    isi: '',
    kategori: 'tips' as CommunityPost['kategori'],
  };

  filters: { value: 'semua' | 'tips' | 'motivasi' | 'pencapaian' | 'resep', label: string, emoji: string }[] = [
    { value: 'semua', label: 'Semua', emoji: '' },
    { value: 'tips', label: 'Tips', emoji: '' },
    { value: 'motivasi', label: 'Motivasi', emoji: '' },
    { value: 'pencapaian', label: 'Pencapaian', emoji: '' },
    { value: 'resep', label: 'Resep', emoji: '' },
  ];

  kategoriEmojis: { [key: string]: string } = {
    tips: '', motivasi: '', pencapaian: '', resep: ''
  };

  constructor(
    public storage: StorageService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.storage.initCommunityPosts();
  }

  ionViewWillEnter() {
    this.loadPosts();
  }

  loadPosts() {
    this.posts = this.storage.getCommunityPosts();
  }

  get filteredPosts(): CommunityPost[] {
    if (this.activeFilter === 'semua') return this.posts;
    return this.posts.filter(p => p.kategori === this.activeFilter);
  }

  toggleLike(post: CommunityPost) {
    this.storage.toggleLike(post.id);
    this.loadPosts();
  }

  // ========================
  // KOMENTAR
  // ========================
  toggleComments(postId: string) {
    if (this.expandedPostId === postId) {
      this.expandedPostId = null;
    } else {
      this.expandedPostId = postId;
      this.loadComments(postId);
    }
  }

  loadComments(postId: string) {
    this.commentsMap[postId] = this.storage.getCommentsByPost(postId);
  }

  getComments(postId: string): Comment[] {
    return this.commentsMap[postId] || [];
  }

  getCommentCount(postId: string): number {
    return this.storage.getCommentCount(postId);
  }

  submitComment(postId: string) {
    const text = (this.newCommentText[postId] || '').trim();
    if (!text) return;

    const profile = this.storage.getProfile();
    const comment: Comment = {
      id: this.storage.generateId(),
      postId,
      penulis: profile?.nama || 'Aku',
      isi: text,
      tanggal: this.storage.getTodayString(),
      timestamp: Date.now(),
    };
    this.storage.addComment(comment);
    this.newCommentText[postId] = '';
    this.loadComments(postId);
  }

  async deleteComment(commentId: string, postId: string) {
    const profile = this.storage.getProfile();
    const comments = this.storage.getCommentsByPost(postId);
    const comment = comments.find(c => c.id === commentId);
    // Hanya bisa hapus komentar sendiri
    if (comment && comment.penulis !== (profile?.nama || 'Aku')) return;

    this.storage.deleteComment(commentId);
    this.loadComments(postId);
  }

  formatCommentTime(timestamp: number): string {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
    return `${Math.floor(diff / 1440)} hari lalu`;
  }

  // ========================
  // POST BARU
  // ========================
  async submitPost() {
    if (!this.newPost.judul.trim() || !this.newPost.isi.trim()) {
      const alert = await this.alertCtrl.create({
        header: 'Perhatian',
        message: 'Judul dan isi postingan tidak boleh kosong!',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const profile = this.storage.getProfile();
    const post: CommunityPost = {
      id: this.storage.generateId(),
      judul: this.newPost.judul,
      isi: this.newPost.isi,
      kategori: this.newPost.kategori,
      penulis: profile?.nama || 'Aku',
      tanggal: this.storage.getTodayString(),
      likes: 0,
      emoji: this.kategoriEmojis[this.newPost.kategori],
    };
    this.storage.addCommunityPost(post);
    this.loadPosts();
    this.showAddForm = false;
    this.newPost = { judul: '', isi: '', kategori: 'tips' };

    const toast = await this.toastCtrl.create({
      message: 'Postingan berhasil dibagikan!',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  getKategoriColor(kategori: string): string {
    const colors: { [key: string]: string } = {
      tips: '#60a5fa', motivasi: '#f97316', pencapaian: '#facc15', resep: '#4ade80',
    };
    return colors[kategori] || '#94a3b8';
  }

  formatDate(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  get filterOptions(): { value: 'tips' | 'motivasi' | 'pencapaian' | 'resep', label: string, emoji: string }[] {
    return [
      { value: 'tips', label: 'Tips', emoji: '' },
      { value: 'motivasi', label: 'Motivasi', emoji: '' },
      { value: 'pencapaian', label: 'Pencapaian', emoji: '' },
      { value: 'resep', label: 'Resep', emoji: '' },
    ];
  }
}
