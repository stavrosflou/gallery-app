import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PopupMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private messageSubject = new BehaviorSubject<PopupMessage | null>(null);
  public message$: Observable<PopupMessage | null> = this.messageSubject.asObservable();

  constructor() { }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 0) {
    this.messageSubject.next({ message, type, duration });
    
    // Only auto-hide if duration is greater than 0
    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  hide() {
    this.messageSubject.next(null);
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }
}
