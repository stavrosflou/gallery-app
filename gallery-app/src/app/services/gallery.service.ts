import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = `${environment.apiBaseUrl}/images/gallery/`;
  private imagesCache: any[] | null = null;
  private localDataUrl = 'assets/data/paintings.json';
  private images$: Observable<any[]> | null = null;

  constructor(private http: HttpClient) { }

  getImages(): Observable<any> {
    // If we already have cached data in memory, return it immediately
    if (this.imagesCache) {
      return of(this.imagesCache);
    }
    
    // If a request is already in flight, share it
    if (this.images$) {
      return this.images$;
    }
    
    // Use local JSON data instead of backend API with shareReplay to prevent multiple requests
    this.images$ = this.http.get<any[]>(this.localDataUrl).pipe(
      map(data => {
        // Transform the data to match the expected format
        return data.map(item => ({
          id: item.id,
          title: item.title,
          artist: item.artist,
          description: item.description,
          year: item.year,
          dimensions: item.dimensions,
          materials: item.materials,
          price: item.price,
          ownershipCost: item.ownershipCost,
          url: item.url
        }));
      }),
      tap(data => {
        this.imagesCache = data;
        this.images$ = null; // Clear the observable after caching
      }),
      shareReplay(1) // Share the result with all subscribers
    );
    
    return this.images$;
  }

  getImageById(id: number): Observable<any> {
    if (this.imagesCache) {
      const found = this.imagesCache.find(item => Number(item.id) === Number(id));
      if (found) {
        return of(found);
      }
    }
    
    // If not in cache, load all data first
    return this.getImages().pipe(
      map(data => {
        const found = data.find((item: any) => Number(item.id) === Number(id));
        return found || null;
      })
    );
  }

  getRandomImages(): Observable<any> {
    return this.getImages().pipe(
      map(data => {
        // Return random selection of images
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 6); // Return 6 random images
      })
    );
  }
}