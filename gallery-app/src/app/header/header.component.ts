import { Component, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  menuItems = [
    { label: 'Home', value: 'home' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'About', value: 'about' },
    { label: 'Contact', value: 'contact' },
  ];
  selectedMenu: string | null = null;
  @ViewChild('dropdown') dropdown!: Dropdown;
  constructor(private location: Location) {}
  get showBackIcon(): boolean {
    return this.location.path().includes('/image');
  }
  goBack() {
    this.location.back();
  }
}
