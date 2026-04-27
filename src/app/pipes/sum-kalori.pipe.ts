import { Pipe, PipeTransform } from '@angular/core';
import { FoodLog } from '../models/models';

@Pipe({ name: 'sumKalori', standalone: true })
export class SumKaloriPipe implements PipeTransform {
  transform(logs: FoodLog[]): number {
    return Math.round(logs.reduce((a, l) => a + l.kalori, 0));
  }
}
