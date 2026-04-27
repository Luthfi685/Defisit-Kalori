import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { UserProfile, DailySummary } from '../models/models';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.page.html',
  styleUrls: ['./progress.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ProgressPage implements OnInit {
  profile: UserProfile | null = null;
  summaries: DailySummary[] = [];
  chartMode: 'kalori' | 'berat' | 'protein' | 'lemak' | 'karbo' = 'kalori';
  period = 7;
  chart: any;

  constructor(
    private storage: StorageService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.profile = this.storage.getProfile();
    this.loadData();
  }

  loadData() {
    // Ambil data asli dari storage
    const rawData = this.storage.getAllDailySummaries();
    
    // Bikin "Padding" agar grafik selalu penuh (misal 7 hari terakhir terhitung dari hari ini)
    const padded: DailySummary[] = [];
    const today = new Date();
    
    for (let i = this.period - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const existing = rawData.find(s => s.tanggal === dateStr);
      if (existing) {
        padded.push(existing);
      } else {
        // Placeholder data kosong biar bar tetap ada tapi 0
        padded.push({
          tanggal: dateStr,
          totalKalori: 0, totalProtein: 0, totalLemak: 0,
          totalKarbo: 0, totalSerat: 0, totalKalsium: 0, totalBesi: 0,
          beratBadan: 0
        });
      }
    }
    
    this.summaries = padded;
    setTimeout(() => {
      this.updateChart();
    }, 100);
  }

  get displaySummaries(): DailySummary[] {
    return this.summaries;
  }

  get totalDaysTracked(): number {
    return this.storage.getAllDailySummaries().filter(d => d.totalKalori > 0).length;
  }

  get avgKaloriHarian(): number {
    const s = this.displaySummaries.filter(d => d.totalKalori > 0);
    if (!s.length) return 0;
    return Math.round(s.reduce((a, d) => a + d.totalKalori, 0) / s.length);
  }

  get avgProtein(): number {
    const s = this.displaySummaries.filter(d => d.totalProtein > 0);
    if (!s.length) return 0;
    return Math.round(s.reduce((a, d) => a + d.totalProtein, 0) / s.length * 10) / 10;
  }

  get avgLemak(): number {
    const s = this.displaySummaries.filter(d => d.totalLemak > 0);
    if (!s.length) return 0;
    return Math.round(s.reduce((a, d) => a + d.totalLemak, 0) / s.length * 10) / 10;
  }

  get avgKarbo(): number {
    const s = this.displaySummaries.filter(d => d.totalKarbo > 0);
    if (!s.length) return 0;
    return Math.round(s.reduce((a, d) => a + d.totalKarbo, 0) / s.length * 10) / 10;
  }

  get avgSerat(): number {
    const s = this.displaySummaries.filter(d => d.totalSerat > 0);
    if (!s.length) return 0;
    return Math.round(s.reduce((a, d) => a + d.totalSerat, 0) / s.length * 10) / 10;
  }

  get streakDays(): number {
    const all = this.storage.getAllDailySummaries()
      .filter(d => d.totalKalori > 0)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    if (!all.length) return 0;
    let streak = 0;
    let checkDate = new Date();
    for (const s of all) {
      const d = new Date(s.tanggal);
      const diff = Math.floor((checkDate.getTime() - d.getTime()) / 86400000);
      if (diff > 1) break;
      streak++;
      checkDate = d;
    }
    return streak;
  }

  get beratAwal(): number {
    return this.profile?.beratBadan || 0;
  }

  get beratTerkini(): number {
    const withWeight = this.displaySummaries.filter(s => s.beratBadan && s.beratBadan > 0);
    return withWeight.length > 0 ? withWeight[withWeight.length - 1].beratBadan || 0 : this.beratAwal;
  }

  get turunBerat(): number {
    const diff = Math.round((this.beratAwal - this.beratTerkini) * 10) / 10;
    return diff;
  }

  get isChartEmpty(): boolean {
    return this.displaySummaries.every(s => s.totalKalori === 0 && (!s.beratBadan || s.beratBadan === 0));
  }

  // ============== CHART.JS LOGIC ============== //

  updateChart() {
    const canvas = document.getElementById('progressChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    if (this.isChartEmpty) return;

    const labels = this.displaySummaries.map(s => {
      const parts = s.tanggal.split('-');
      return `${parts[2]}/${parts[1]}`;
    });

    let dataItems: number[] = [];
    let targetVal = 0;
    let labelNm = '';

    if (this.chartMode === 'kalori') {
      dataItems = this.displaySummaries.map(s => s.totalKalori);
      targetVal = this.profile?.targetKalori || 2000;
      labelNm = 'Kalori (Kkal)';
    } else if (this.chartMode === 'berat') {
      dataItems = this.displaySummaries.map(s => s.beratBadan || NaN);
      targetVal = this.profile?.beratTarget || 0;
      labelNm = 'Berat (kg)';
    } else if (this.chartMode === 'protein') {
      dataItems = this.displaySummaries.map(s => s.totalProtein);
      targetVal = this.profile?.targetProtein || 100;
      labelNm = 'Protein (g)';
    } else if (this.chartMode === 'lemak') {
      dataItems = this.displaySummaries.map(s => s.totalLemak);
      targetVal = this.profile?.targetLemak || 60;
      labelNm = 'Lemak (g)';
    } else if (this.chartMode === 'karbo') {
      dataItems = this.displaySummaries.map(s => s.totalKarbo);
      targetVal = this.profile?.targetKarbo || 200;
      labelNm = 'Karbo (g)';
    }

    let bgColors: any = '#f59e0b';
    if (this.chartMode === 'berat') bgColors = '#3b82f6';
    else if (this.chartMode === 'protein') bgColors = '#8b5cf6';
    else if (this.chartMode === 'lemak') bgColors = '#f97316';
    else if (this.chartMode === 'karbo') bgColors = '#06b6d4';
    else {
      bgColors = this.displaySummaries.map(s => {
        if (s.totalKalori === 0) return '#f1f5f9';
        const r = s.totalKalori / targetVal;
        if (r <= 0.8) return '#10b981';
        if (r <= 1.0) return '#f59e0b';
        return '#ef4444';
      });
    }

    const type = this.chartMode === 'berat' ? 'line' : 'bar';
    const datasets: any[] = [
      {
        type,
        label: labelNm,
        data: dataItems,
        backgroundColor: bgColors,
        borderColor: this.chartMode === 'berat' ? '#3b82f6' : 'transparent',
        borderWidth: this.chartMode === 'berat' ? 4 : 0,
        borderRadius: 8,
        pointBackgroundColor: 'white',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 3,
        pointRadius: this.chartMode === 'berat' ? 5 : 0,
        spanGaps: true
      }
    ];

    if (targetVal > 0) {
      datasets.push({
        type: 'line',
        label: 'Target',
        data: this.displaySummaries.map(() => targetVal),
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        backgroundColor: 'transparent'
      });
    }

    this.chart = new Chart(canvas, {
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: this.chartMode !== 'berat',
            grid: { color: '#f1f5f9' },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }

  // ============== END CHART.JS ============== //

  get recentLogs(): DailySummary[] {
    return [...this.displaySummaries].filter(s => s.totalKalori > 0 || (s.beratBadan && s.beratBadan > 0)).reverse();
  }

  getLabelDate(summary: DailySummary): string {
    const parts = summary.tanggal.split('-');
    return `${parts[2]}/${parts[1]}`;
  }

  getDaysAgo(tanggal: string): string {
    const today = new Date();
    today.setHours(0,0,0,0);
    const date = new Date(tanggal);
    date.setHours(0,0,0,0);
    const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return 'Hari ini';
    if (diff === 1) return 'Kemarin';
    return `${diff} hari lalu`;
  }


  async exportLaporan() {
    const s = this.recentLogs.slice(0, 7); // 7 hari terakhir
    if (s.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Belum ada data untuk di-export.', duration: 2000, color: 'warning'
      });
      return toast.present();
    }

    let text = `📊 Laporan Diet KalorIku (${this.profile?.nama || 'Pengguna'})\n`;
    text += `Periode: 7 Hari Terakhir\n\n`;
    s.forEach(log => {
      text += `📅 ${log.tanggal}\n`;
      text += `Kalori: ${log.totalKalori} / ${this.profile?.targetKalori} kkal\n`;
      text += `Protein: ${log.totalProtein}g, Lemak: ${log.totalLemak}g, Karbo: ${log.totalKarbo}g\n`;
      if (log.beratBadan && log.beratBadan > 0) {
        text += `BB: ${log.beratBadan} kg\n`;
      }
      text += `\n`;
    });

    const alert = await this.alertCtrl.create({
      header: 'Laporan Siap',
      message: 'Laporan berhasil dibuat. Silakan salin teks ini untuk dibagikan.',
      inputs: [{ type: 'textarea', value: text, cssClass: 'export-textarea' }],
      buttons: ['Selesai']
    });
    await alert.present();
  }
}
