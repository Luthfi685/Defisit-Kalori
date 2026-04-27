import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError, forkJoin } from 'rxjs';
import { FoodItem } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private localFoodsUrl = 'assets/data/foods.json';
  private spoonacularUrl = 'https://api.spoonacular.com/food/ingredients';
  private apiKey = 'edd7462eb9a546e1a29b2a671ec7f915';

  constructor(private http: HttpClient) {}

  /**
   * Mencari makanan dari database lokal DAN online Spoonacular
   */
  searchFoodHybrid(query: string): Observable<{ local: FoodItem[], online: FoodItem[] }> {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 3) return of({ local: [], online: [] });

    // 1. Ambil data lokal (Common Indo Foods)
    const localObs = this.http.get<FoodItem[]>(this.localFoodsUrl).pipe(
      map(foods => foods.filter(f => f.nama.toLowerCase().includes(q))),
      catchError(() => of([]))
    );

    // 2. Ambil data online (Spoonacular Search)
    // Catatan: Search cuma dapet ID dan Nama. Detail nutrisi menyusul saat diklik (atau via batch)
    // Agar user dapet feedback instan, kita tampilkan list-nya dulu.
    const searchUrl = `${this.spoonacularUrl}/search?query=${encodeURIComponent(q)}&number=15&apiKey=${this.apiKey}`;
    
    const onlineObs = this.http.get<any>(searchUrl).pipe(
      map(res => {
        if (!res || !res.results) return [];
        return res.results.map((item: any) => ({
          id: item.id,
          nama: item.name,
          brand: 'Global Database',
          kalori: 0, // Akan diisi saat diklik (Loading...)
          protein: 0, lemak: 0, karbo: 0, serat: 0, kalsium: 0, besi: 0,
          image: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : ''
        }));
      }),
      catchError(() => of([]))
    );

    return forkJoin({ local: localObs, online: onlineObs });
  }

  /**
   * Mengambil detail nutrisi lengkap dari Spoonacular berdasarkan ID
   */
  getFoodDetail(id: number | string): Observable<FoodItem | null> {
    const url = `${this.spoonacularUrl}/${id}/information?amount=100&unit=grams&apiKey=${this.apiKey}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        if (!res) return null;
        const n = res.nutrition?.nutrients || [];
        const findN = (name: string) => n.find((x: any) => x.name === name)?.amount || 0;

        return {
          id: res.id,
          nama: res.name,
          brand: res.aisle || 'Global',
          kalori: Math.round(findN('Calories')),
          protein: Math.round(findN('Protein') * 10) / 10,
          lemak: Math.round(findN('Fat') * 10) / 10,
          karbo: Math.round(findN('Carbohydrates') * 10) / 10,
          serat: Math.round(findN('Fiber') * 10) / 10,
          kalsium: Math.round(findN('Calcium')),
          besi: Math.round(findN('Iron') * 10) / 10,
          image: res.image ? `https://spoonacular.com/cdn/ingredients_100x100/${res.image}` : '',
          isCustom: false
        };
      }),
      catchError(() => of(null))
    );
  }
}
