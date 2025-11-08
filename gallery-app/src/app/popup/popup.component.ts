import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../pipes/translate.pipe';
import { TranslationService } from '../services/translation.service';
import { EmailService } from '../services/email.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() paintingInfo?: { title: string; artist: string; id: number };
  @Output() closePopup = new EventEmitter<void>();

  name = '';
  email = '';
  phone = '';
  message = '';
  isSubmitting = false;
  showValidationErrors = false;
  
  // Anti-spam measures
  private lastSubmissionTime: number = 0;
  private readonly MIN_TIME_BETWEEN_SUBMISSIONS = 10000; // 10 seconds

  constructor(
    private translationService: TranslationService,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    // Prevent body scroll when popup is open
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    // Restore body scroll when component is destroyed
    document.body.style.overflow = '';
  }

  ngOnChanges() {
    // Handle isOpen changes
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  close() {
    this.resetForm();
    document.body.style.overflow = ''; // Restore scroll
    this.closePopup.emit();
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.message = '';
    this.isSubmitting = false;
    this.showValidationErrors = false;
  }

  async onSubmit() {
    // Always show validation errors when user tries to submit
    this.showValidationErrors = true;
    
    // Validate form data before submitting
    if (!this.isFormValid()) {
      return;
    }
    
    // Anti-spam check: Submissions too close together
    if (this.lastSubmissionTime > 0) {
      const timeSinceLastSubmission = Date.now() - this.lastSubmissionTime;
      if (timeSinceLastSubmission < this.MIN_TIME_BETWEEN_SUBMISSIONS) {
        const waitSeconds = Math.ceil((this.MIN_TIME_BETWEEN_SUBMISSIONS - timeSinceLastSubmission) / 1000);
        alert(this.translationService.translate('popup.waitBetweenSubmissionsError') || `Please wait ${waitSeconds} seconds before submitting again.`);
        return;
      }
    }

    this.isSubmitting = true;

    try {
      // Send email using EmailJS with painting information
      const success = await this.emailService.sendEmail({
        name: this.name,
        email: this.email,
        phone: this.phone,
        message: this.message
      }, this.paintingInfo);

      if (success) {
        this.lastSubmissionTime = Date.now();
        alert(this.translationService.translate('popup.successMessage'));
        this.close();
      } else {
        throw new Error('Email sending failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(this.translationService.translate('popup.errorMessage'));
    } finally {
      this.isSubmitting = false;
    }
  }

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  isFormValid(): boolean {
    // Check if all required fields are filled and valid
    return this.isNameValid() && this.isEmailValid() && this.isPhoneValid() && this.isMessageValid();
  }

  private isNameValid(): boolean {
    return this.name.trim().length >= 2;
  }

  private isEmailValid(): boolean {
    return this.email.trim().length > 0 && this.emailRegex.test(this.email);
  }

  private isPhoneValid(): boolean {
    return this.phone.trim().length > 0 && /^[\+]?[\d\s\-\(\)]{8,}$/.test(this.phone.trim());
  }

  private isMessageValid(): boolean {
    return this.message.trim().length > 0;
  }

  isEmailInvalid(): boolean {
    if (!this.email.trim()) {
      return false; // Don't show invalid message if empty (required message will show)
    }
    return !this.emailRegex.test(this.email);
  }

  isNameInvalid(): boolean {
    return this.name.trim().length > 0 && this.name.trim().length < 2;
  }

  isPhoneInvalid(): boolean {
    if (!this.phone.trim()) {
      return false; // Don't show invalid message if empty (required message will show)
    }
    return !/^[\+]?[\d\s\-\(\)]{8,}$/.test(this.phone.trim());
  }
}
