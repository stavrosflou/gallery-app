import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupService, PopupMessage } from '../services/popup.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, OnDestroy {
  message: PopupMessage | null = null;
  private subscription?: Subscription;

  constructor(private popupService: PopupService) {}

  ngOnInit() {
    this.subscription = this.popupService.message$.subscribe(
      (message) => {
        this.message = message;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  close() {
    this.popupService.hide();
  }
}
