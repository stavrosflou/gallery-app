import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../pipes/translate.pipe';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  @Input() isOpen = false;
  @Output() closePopup = new EventEmitter<void>();

  name = '';
  email = '';
  message = '';
  isSubmitting = false;

  constructor(private translationService: TranslationService) {}

  close() {
    this.resetForm();
    this.closePopup.emit();
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.message = '';
    this.isSubmitting = false;
  }

  async onSubmit() {
    if (!this.name || !this.email || !this.message) {
      alert(this.translationService.translate('popup.fillAllFields'));
      return;
    }

    this.isSubmitting = true;

    // Simulate email sending (replace with actual email service)
    try {
      // Here you would typically call an API endpoint to send the email
      console.log('Sending email:', { name: this.name, email: this.email, message: this.message });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(this.translationService.translate('popup.successMessage'));
      this.close();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(this.translationService.translate('popup.errorMessage'));
    } finally {
      this.isSubmitting = false;
    }
  }
}
