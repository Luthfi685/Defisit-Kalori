import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { UserProfile, FoodLog, DailySummary } from '../models/models';
import { AlertController } from '@ionic/angular';
import { SumKaloriPipe } from '../pipes/sum-kalori.pipe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, SumKaloriPipe],
})
export class DashboardPage implements OnInit {
  profile: UserProfile | null = null;
  todayLogs: FoodLog[] = [];
  todaySummary: DailySummary | null = null;
  today = '';
  todayDisplay = '';
  beratHariIni: number | null = null;
  inputBerat: number | null = null;
  showBeratInput = false;

  waktuMakan = ['sarapan', 'makan_siang', 'makan_malam', 'camilan'];
  waktuLabel: { [key: string]: string } = {
    sarapan: 'Sarapan',
    makan_siang: 'Makan Siang',
    makan_malam: 'Makan Malam',
    camilan: 'Camilan',
  };

  constructor(
    private storage: StorageService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.today = this.storage.getTodayString();
    this.todayDisplay = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  ionViewWillEnter() {
    this.profile = this.storage.getProfile();
    this.loadToday();
  }

  loadToday() {
    this.todayLogs = this.storage.getFoodLogsByDate(this.today);
    this.todaySummary = this.storage.getDailySummary(this.today);
    const s = this.storage.getDailySummary(this.today);
    this.beratHariIni = s?.beratBadan || null;
  }

  get kaloriMasuk(): number {
    return this.todaySummary?.totalKalori || 0;
  }

  get kaloriSisa(): number {
    const target = this.profile?.targetKalori || 2000;
    return target - this.kaloriMasuk;
  }

  get kaloriProgress(): number {
    const target = this.profile?.targetKalori || 2000;
    return Math.min(100, Math.round((this.kaloriMasuk / target) * 100));
  }

  get proteinProgress(): number {
    const target = this.profile?.targetProtein || 100;
    return Math.min(100, Math.round(((this.todaySummary?.totalProtein || 0) / target) * 100));
  }

  get lemakProgress(): number {
    const target = this.profile?.targetLemak || 60;
    return Math.min(100, Math.round(((this.todaySummary?.totalLemak || 0) / target) * 100));
  }

  get karboProgress(): number {
    const target = this.profile?.targetKarbo || 200;
    return Math.min(100, Math.round(((this.todaySummary?.totalKarbo || 0) / target) * 100));
  }

  get seratProgress(): number {
    const target = this.profile?.targetSerat || 25;
    return Math.min(100, Math.round(((this.todaySummary?.totalSerat || 0) / target) * 100));
  }

  get kalsiumProgress(): number {
    const target = this.profile?.targetKalsium || 1000;
    return Math.min(100, Math.round(((this.todaySummary?.totalKalsium || 0) / target) * 100));
  }

  get besiProgress(): number {
    const target = this.profile?.targetBesi || 18;
    return Math.min(100, Math.round(((this.todaySummary?.totalBesi || 0) / target) * 100));
  }

  getMicroStatus(progress: number): { color: string; label: string } {
    if (progress >= 100) return { color: '#10b981', label: 'Terpenuhi' };
    if (progress >= 60) return { color: '#f59e0b', label: 'Hampir' };
    return { color: '#ef4444', label: 'Kurang' };
  }

  getMicroWarnings(): string[] {
    const warnings: string[] = [];
    if (this.seratProgress < 50) warnings.push('Serat masih kurang — tambah sayur & buah!');
    if (this.kalsiumProgress < 50) warnings.push('Kalsium rendah — coba susu atau tempe!');
    if (this.besiProgress < 50) warnings.push('Zat besi kurang — konsumsi daging atau bayam!');
    return warnings;
  }

  getProgressColor(): string {
    if (this.kaloriProgress <= 70) return '#10b981';
    if (this.kaloriProgress <= 90) return '#f59e0b';
    return '#ef4444';
  }

  getLogsByWaktu(waktu: string): FoodLog[] {
    return this.todayLogs.filter(l => l.waktu === waktu);
  }

  async deleteLog(log: FoodLog) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Log',
      message: `Hapus ${log.nama}?`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus', role: 'destructive',
          handler: () => {
            this.storage.deleteFoodLog(log.id, this.today);
            this.loadToday();
          }
        }
      ]
    });
    await alert.present();
  }

  saveBerat() {
    if (this.inputBerat && this.inputBerat > 0) {
      this.storage.saveBodyWeight(this.today, this.inputBerat);
      this.beratHariIni = this.inputBerat;
      this.showBeratInput = false;
      this.inputBerat = null;

      // Recalculate target kalori & makro berdasarkan BB baru
      if (this.profile && this.beratHariIni) {
        this.profile.beratBadan = this.beratHariIni;
        let bmr = 0;
        if (this.profile.gender === 'pria') {
          bmr = 10 * this.beratHariIni + 6.25 * this.profile.tinggiBadan - 5 * this.profile.umur + 5;
        } else {
          bmr = 10 * this.beratHariIni + 6.25 * this.profile.tinggiBadan - 5 * this.profile.umur - 161;
        }
        
        this.profile.bmr = Math.round(bmr);
        this.profile.tdee = Math.round(bmr * this.profile.levelAktivitas);
        this.profile.targetKalori = Math.max(1200, this.profile.tdee - this.profile.targetDefisit);
        
        // Update makro
        this.profile.targetProtein = Math.round((this.profile.targetKalori * 0.30) / 4);
        this.profile.targetLemak = Math.round((this.profile.targetKalori * 0.25) / 9);
        this.profile.targetKarbo = Math.round((this.profile.targetKalori * 0.45) / 4);
        
        this.storage.saveProfile(this.profile);
      }
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 10) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }

  getStatusMessage(): string {
    const p = this.kaloriProgress;
    if (p === 0) return 'Belum ada catatan hari ini. Yuk mulai catat!';
    if (p <= 50) return 'Bagus! Masih banyak kalori tersisa.';
    if (p <= 80) return 'Tetap jaga pola makanmu ya!';
    if (p <= 100) return 'Hampir mencapai target. Jaga dirimu!';
    return 'Kalori hari ini sudah melebihi target!';
  }

}
