import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = 'http://127.0.0.1:8000/images/gallery/';
  private imagesCache: any[] | null = null;

  constructor(private http: HttpClient) { }

  getImages(): Observable<any> {
    if (this.imagesCache) {
      return of(this.imagesCache);
    }
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => this.imagesCache = data)
    );
  }

  // Try to resolve from cache first, fall back to API if not present
  getImageById(id: number): Observable<any> {
    if (this.imagesCache) {
      const found = this.imagesCache.find(item => Number(item.id) === Number(id));
      if (found) {
        return of(found);
      }
    }
    // backend single-item endpoint (adjust URL if needed)
    return this.http.get<any>(`${this.apiUrl}${id}/`).pipe(
      tap(item => {
        // keep cache in sync (optional)
        if (this.imagesCache) {
          const exists = this.imagesCache.find(x => Number(x.id) === Number(item.id));
          if (!exists) this.imagesCache.push(item);
        } else {
          this.imagesCache = [item];
        }
      })
    );
  }

}