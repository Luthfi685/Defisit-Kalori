import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { UserProfile } from '../models/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ProfilePage implements OnInit {
  profile: UserProfile | null = null;
  isEditing = false;

  editData = {
    beratBadan: 0,
    tinggiBadan: 0,
    beratTarget: 0,
    levelAktivitas: 1.375,
    targetDefisit: 500,
  };

  activityLevels = [
    { value: 1.2, label: 'Tidak Aktif' },
    { value: 1.375, label: 'Sedikit Aktif' },
    { value: 1.55, label: 'Cukup Aktif' },
    { value: 1.725, label: 'Sangat Aktif' },
    { value: 1.9, label: 'Ekstra Aktif' },
  ];

  constructor(
    private storage: StorageService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.profile = this.storage.getProfile();
    if (this.profile) {
      this.editData = {
        beratBadan: this.profile.beratBadan,
        tinggiBadan: this.profile.tinggiBadan,
        beratTarget: this.profile.beratTarget,
        levelAktivitas: this.profile.levelAktivitas,
        targetDefisit: this.profile.targetDefisit,
      };
    }
  }

  get bmi(): number {
    if (!this.profile) return 0;
    const h = this.profile.tinggiBadan / 100;
    return Math.round((this.profile.beratBadan / (h * h)) * 10) / 10;
  }

  get bmiCategory(): string {
    if (this.bmi < 18.5) return 'Kurus';
    if (this.bmi < 25) return 'Ideal';
    if (this.bmi < 30) return 'Gemuk';
    return 'Obesitas';
  }

  get bmiColor(): string {
    if (this.bmi < 18.5) return '#60a5fa';
    if (this.bmi < 25) return '#4ade80';
    if (this.bmi < 30) return '#facc15';
    return '#f87171';
  }

  get daysTracked(): number {
    return this.storage.getAllDailySummaries().length;
  }

  get totalCaloriesLogged(): number {
    return this.storage.getAllFoodLogs().length;
  }

  startEdit() { this.isEditing = true; }

  cancelEdit() {
    this.isEditing = false;
    if (this.profile) {
      this.editData = {
        beratBadan: this.profile.beratBadan,
        tinggiBadan: this.profile.tinggiBadan,
        beratTarget: this.profile.beratTarget,
        levelAktivitas: this.profile.levelAktivitas,
        targetDefisit: this.profile.targetDefisit,
      };
    }
  }

  async saveEdit() {
    if (!this.profile) return;
    const bmr = this.profile.gender === 'pria'
      ? 10 * this.editData.beratBadan + 6.25 * this.editData.tinggiBadan - 5 * this.profile.umur + 5
      : 10 * this.editData.beratBadan + 6.25 * this.editData.tinggiBadan - 5 * this.profile.umur - 161;

    const tdee = Math.round(bmr * this.editData.levelAktivitas);
    const targetKalori = Math.max(1200, tdee - this.editData.targetDefisit);
    const targetProtein = Math.round((targetKalori * 0.30) / 4);
    const targetLemak = Math.round((targetKalori * 0.25) / 9);
    const targetKarbo = Math.round((targetKalori * 0.45) / 4);

    const updated: UserProfile = {
      ...this.profile,
      ...this.editData,
      beratBadan: Number(this.editData.beratBadan),
      bmr: Math.round(bmr),
      tdee,
      targetKalori,
      targetProtein,
      targetLemak,
      targetKarbo,
    };
    this.storage.saveProfile(updated);
    this.profile = updated;
    this.isEditing = false;

    const toast = await this.toastCtrl.create({
      message: 'Profil berhasil diperbarui!',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  async resetApp() {
    const alert = await this.alertCtrl.create({
      header: 'Reset Semua Data',
      message: 'Semua data termasuk profil, log makanan, dan riwayat akan dihapus permanen. Yakin?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Reset', role: 'destructive',
          handler: () => {
            this.storage.clearAll();
            this.router.navigate(['/onboarding'], { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }

  getActivityLabel(): string {
    return this.activityLevels.find(a => a.value === this.profile?.levelAktivitas)?.label || '';
  }

  getEstimatedWeeks(): number {
    if (!this.profile) return 0;
    const diff = this.profile.beratBadan - this.profile.beratTarget;
    if (diff <= 0) return 0;
    return Math.round((diff * 7700) / (this.profile.targetDefisit * 7));
  }
}
