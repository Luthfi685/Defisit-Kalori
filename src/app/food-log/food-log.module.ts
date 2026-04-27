import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { FoodLogPageRoutingModule } from './food-log-routing.module';
import { FoodLogPage } from './food-log.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    FoodLogPageRoutingModule,
    FoodLogPage
  ]
})
export class FoodLogPageModule { }
