import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, DropdownModule, SplitButtonModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {

  currentLanguageCode = 'en';
  isDarkMode = false;
  themeAnimating = false;
  
  @ViewChild('dropdown') dropdown!: Dropdown;
  
  constructor(
    private translationService: TranslationService
  ) {
    this.currentLanguageCode = this.translationService.getCurrentLanguage();
    
    // Subscribe to language changes
    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguageCode = lang;
    });
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  
  changeLanguage(langCode: string) {
    this.translationService.setLanguage(langCode);
  }
  
  toggleTheme() {
    this.themeAnimating = true;
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
    
    // Reset animation trigger after animation completes
    setTimeout(() => {
      this.themeAnimating = false;
    }, 300);
  }
  
  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
