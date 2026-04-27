import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'food-log',
        loadComponent: () => import('../food-log/food-log.page').then(m => m.FoodLogPage)
      },
      {
        path: 'progress',
        loadComponent: () => import('../progress/progress.page').then(m => m.ProgressPage)
      },
      {
        path: 'community',
        loadComponent: () => import('../community/community.page').then(m => m.CommunityPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
