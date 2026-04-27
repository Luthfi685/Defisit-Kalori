import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class TabsPage {
  constructor(private router: Router, private storage: StorageService) {
    const profile = this.storage.getProfile();
    if (!profile) {
      this.router.navigate(['/onboarding']);
    }
  }
}
