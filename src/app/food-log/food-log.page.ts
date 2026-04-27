import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { FoodLog } from '../models/models';

@Component({
  selector: 'app-food-log',
  templateUrl: './food-log.page.html',
  styleUrls: ['./food-log.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class FoodLogPage implements OnInit {
  selectedWaktu: 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan' = 'sarapan';
  today = '';

  manualInput = {
    nama: '',
    kalori: 0,
    protein: 0,
    lemak: 0,
    karbo: 0,
    serat: 0
  };

  waktuOptions: { value: 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan', label: string }[] = [
    { value: 'sarapan', label: 'Sarapan' },
    { value: 'makan_siang', label: 'Makan Siang' },
    { value: 'makan_malam', label: 'Makan Malam' },
    { value: 'camilan', label: 'Camilan' },
  ];

  constructor(
    private storage: StorageService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.today = this.storage.getTodayString();
    
    const hour = new Date().getHours();
    if (hour < 10) this.selectedWaktu = 'sarapan';
    else if (hour < 14) this.selectedWaktu = 'makan_siang';
    else if (hour < 20) this.selectedWaktu = 'makan_malam';
    else this.selectedWaktu = 'camilan';
  }

  async simpanManual() {
    if (!this.manualInput.nama.trim()) {
      const toast = await this.toastCtrl.create({
        message: 'Mohon isi nama makanan dulu ya!',
        duration: 2000, color: 'warning'
      });
      toast.present();
      return;
    }

    const log: FoodLog = {
      id: this.storage.generateId(),
      foodId: 'custom_' + Date.now(),
      nama: this.manualInput.nama,
      waktu: this.selectedWaktu,
      porsi: 1.0,
      kalori: this.manualInput.kalori || 0,
      protein: this.manualInput.protein || 0,
      lemak: this.manualInput.lemak || 0,
      karbo: this.manualInput.karbo || 0,
      serat: this.manualInput.serat || 0,
      kalsium: 0,
      besi: 0,
      tanggal: this.today,
      timestamp: Date.now()
    };

    this.storage.saveFoodLog(log);

    const toast = await this.toastCtrl.create({
      message: `${this.manualInput.nama} berhasil dicatat secara manual!`,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
    
    // Reset form
    this.manualInput = { nama: '', kalori: 0, protein: 0, lemak: 0, karbo: 0, serat: 0 };
  }
}
