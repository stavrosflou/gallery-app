import { Component, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PopupService } from '../services/popup.service';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, SplitButtonModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  menuItems = [
    { 
      label: 'header.about', 
      value: 'about'
    },
    { 
      label: 'header.contact', 
      value: 'contact'
    },
  ];
  selectedMenu: string | null = null;
  isMenuOpen = false;
  currentLanguageCode = 'en';
  isDarkMode = false;
  themeAnimating = false;
  
  @ViewChild('dropdown') dropdown!: Dropdown;
  
  constructor(
    private location: Location, 
    private popupService: PopupService,
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
  
  get showBackIcon(): boolean {
    return this.location.path().includes('/image');
  }
  
  goBack() {
    this.location.back();
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
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
  
  handleMenuClick(menu: string) {
    this.selectedMenu = menu;
    this.isMenuOpen = false;
    
    // Show popup based on menu selection

    if (menu === 'about') {
      this.popupService.info('🎨 Welcome to Central Gallery! Explore our collection of amazing artworks from talented artists around the world.');
    } else if (menu === 'contact') {
      this.popupService.info('📧 Contact us at: gallery@central.com or call +1 (555) 123-4567');
    }
  }
}
