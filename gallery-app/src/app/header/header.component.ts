import { Component, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PopupService } from '../services/popup.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, SplitButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  menuItems = [
    { 
      label: 'More info', 
      value: 'info'
    },
    { 
      label: 'Contact Us', 
      value: 'contact'
    },
  ];
  selectedMenu: string | null = null;
  isMenuOpen = false;
  
  @ViewChild('dropdown') dropdown!: Dropdown;
  constructor(private location: Location, private popupService: PopupService) {}
  
  get showBackIcon(): boolean {
    return this.location.path().includes('/image');
  }
  
  goBack() {
    this.location.back();
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  handleMenuClick(menu: string) {
    this.selectedMenu = menu;
    this.isMenuOpen = false;
    
    // Show popup based on menu selection
    if (menu === 'info') {
      this.popupService.info('🎨 Welcome to Central Gallery! Explore our collection of amazing artworks from talented artists around the world.');
    } else if (menu === 'contact') {
      this.popupService.info('📧 Contact us at: gallery@central.com or call +1 (555) 123-4567');
    }
  }
}
