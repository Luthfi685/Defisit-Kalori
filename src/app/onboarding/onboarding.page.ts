import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { UserProfile } from '../models/models';

interface ActivityLevel {
  value: number;
  label: string;
  desc: string;
  icon: string;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class OnboardingPage implements OnInit {
  step = 1;
  totalSteps = 3;

  nama = '';
  gender: 'pria' | 'wanita' = 'pria';
  umur = 25;
  beratBadan = 70;
  tinggiBadan = 170;
  levelAktivitas = 1.375;
  beratTarget = 65;
  targetDefisit = 500;

  activityLevels: ActivityLevel[] = [
    { value: 1.2, label: 'Tidak Aktif', desc: 'Jarang olahraga', icon: 'bed-outline' },
    { value: 1.375, label: 'Sedikit Aktif', desc: '1-3x olahraga/minggu', icon: 'walk-outline' },
    { value: 1.55, label: 'Cukup Aktif', desc: '3-5x olahraga/minggu', icon: 'fitness-outline' },
    { value: 1.725, label: 'Sangat Aktif', desc: '6-7x olahraga/minggu', icon: 'barbell-outline' },
    { value: 1.9, label: 'Ekstra Aktif', desc: 'Atlet profesional', icon: 'trophy-outline' },
  ];

  bmr = 0;
  tdee = 0;
  targetKalori = 0;
  targetProtein = 0;
  targetLemak = 0;
  targetKarbo = 0;
  // Mikro
  targetSerat = 0;
  targetKalsium = 0;
  targetBesi = 0;

  constructor(private router: Router, private storage: StorageService) {}

  ngOnInit() {
    const profile = this.storage.getProfile();
    if (profile) {
      this.router.navigate(['/tabs']);
    }
  }

  nextStep() {
    if (this.step === 2) {
      this.calculateNutrition();
    }
    if (this.step < this.totalSteps) {
      this.step++;
    }
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  calculateBMR(): number {
    if (this.gender === 'pria') {
      return 10 * this.beratBadan + 6.25 * this.tinggiBadan - 5 * this.umur + 5;
    } else {
      return 10 * this.beratBadan + 6.25 * this.tinggiBadan - 5 * this.umur - 161;
    }
  }

  calculateNutrition() {
    this.bmr = Math.round(this.calculateBMR());
    this.tdee = Math.round(this.bmr * this.levelAktivitas);
    this.targetKalori = Math.max(1200, this.tdee - this.targetDefisit);
    this.targetProtein = Math.round((this.targetKalori * 0.30) / 4);
    this.targetLemak = Math.round((this.targetKalori * 0.25) / 9);
    this.targetKarbo = Math.round((this.targetKalori * 0.45) / 4);
    // Rekomendasi AKG Indonesia
    this.targetSerat = this.gender === 'pria' ? 38 : 25;
    this.targetKalsium = 1000; // mg/hari (dewasa)
    this.targetBesi = this.gender === 'pria' ? 9 : 18; // pria lebih rendah
  }

  getActivityLabel(): string {
    return this.activityLevels.find(a => a.value === this.levelAktivitas)?.label || '';
  }

  getEstimatedWeeks(): number {
    const defisitTotal = Math.max(0, this.beratBadan - this.beratTarget) * 7700;
    const defisitPerHari = this.targetDefisit;
    if (defisitPerHari <= 0) return 0;
    return Math.round(defisitTotal / (defisitPerHari * 7));
  }

  saveProfile() {
    if (!this.nama.trim()) return;
    this.calculateNutrition();
    const profile: UserProfile = {
      nama: this.nama,
      umur: this.umur,
      gender: this.gender,
      beratBadan: this.beratBadan,
      tinggiBadan: this.tinggiBadan,
      levelAktivitas: this.levelAktivitas,
      targetDefisit: this.targetDefisit,
      bmr: this.bmr,
      tdee: this.tdee,
      targetKalori: this.targetKalori,
      targetProtein: this.targetProtein,
      targetLemak: this.targetLemak,
      targetKarbo: this.targetKarbo,
      targetSerat: this.targetSerat,
      targetKalsium: this.targetKalsium,
      targetBesi: this.targetBesi,
      tanggalMulai: this.storage.getTodayString(),
      beratTarget: this.beratTarget,
    };

    this.storage.saveProfile(profile);
    this.storage.initCommunityPosts();
    this.router.navigate(['/tabs'], { replaceUrl: true });
  }

  isStep1Valid(): boolean {
    return this.nama.trim().length > 0;
  }

  isStep2Valid(): boolean {
    return this.beratBadan > 0 && this.tinggiBadan > 0 && this.umur > 0;
  }
}
