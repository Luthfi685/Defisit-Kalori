import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FoodLogPage } from './food-log.page';

const routes: Routes = [
  {
    path: '',
    component: FoodLogPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodLogPageRoutingModule {}
