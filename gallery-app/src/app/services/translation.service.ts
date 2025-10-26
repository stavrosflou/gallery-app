import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Translations {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLanguage = new BehaviorSubject<string>('en');
  private translations: { [lang: string]: Translations } = {
    en: {},
    el: {},
  };

  currentLanguage$: Observable<string> = this.currentLanguage.asObservable();

  constructor(private http: HttpClient) {
    this.http.get<Translations>('/assets/translations/en.json').subscribe({
      next: (data) => {
        this.translations['en'] = this.flattenObject(data);
      },
      error: (err) => console.error('Error loading EN translations:', err),
    });

    // Load Greek translations
    this.http.get<Translations>('/assets/translations/el.json').subscribe({
      next: (data) => {
        this.translations['el'] = this.flattenObject(data);
      },
      error: (err) => console.error('Error loading EL translations:', err),
    });
  }

  //flatten the json object
  private flattenObject(obj: any, prefix: string = ''): Translations {
    const flattened: Translations = {};

    Object.keys(obj).forEach((key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(flattened, this.flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    });

    return flattened;
  }

  setLanguage(lang: string): void {
    if (this.translations[lang]) {
      this.currentLanguage.next(lang);
      localStorage.setItem('appLanguage', lang);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage.value;
  }

  translate(key: string): string {
    const lang = this.currentLanguage.value;
    return this.translations[lang]?.[key] || key;
  }
}
