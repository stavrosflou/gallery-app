import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GalleryService } from '../services/gallery.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../pipes/translate.pipe';
// import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, TranslatePipe],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  // animations: [
  //   trigger('fadeOut', [
  //     transition(':leave', [
  //       animate('800ms ease-out', style({ opacity: 0 }))
  //     ])
  //   ])
  // ]
})
export class GalleryComponent {
  paintings: {
    id: number;
    url: string;
    title: string;
    description: string;
    artist: string;
    year?: number;
    dimensions?: string;
    materials?: string;
    price?: number;
    ownershipCost?: number;
  }[] = [];

  allPaintings: any[] = []; // Store original data
  filteredPaintings: any[] = []; // Store filtered data
  searchTerm: string = '';
  selectedSort: string = '';
  isLoading: boolean = true;
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 0;
  
  // Splash screen properties
  // showSplash: boolean = false;
  // splashPainting: any = null;

  constructor(
    private galleryService: GalleryService, 
    private router: Router
  ) {}

  ngOnInit() {
    // Check if splash was already shown in this tab session
    // const splashShown = sessionStorage.getItem('splash-shown');
    
    // Fetch images from local JSON data
    this.isLoading = true;
    this.galleryService.getImages().subscribe((data) => {
      this.allPaintings = data.map((item: any) => ({
        id: item.id,
        url: item.url,
        title: item.title,
        description: item.description,
        artist: item.artist,
        year: item.year,
        dimensions: item.dimensions,
        materials: item.materials,
        price: item.price,
        ownershipCost: item.ownershipCost
      }));
      this.applyFiltersAndSort();
      this.isLoading = false;
      
      // Show splash only once per tab session
      // if (!splashShown && this.allPaintings.length > 0) {
      //   this.showSplash = true;
      //   const randomIndex = Math.floor(Math.random() * this.allPaintings.length);
      //   this.splashPainting = this.allPaintings[randomIndex];
        
      //   // Mark splash as shown for this tab session
      //   sessionStorage.setItem('splash-shown', 'true');
        
      //   setTimeout(() => {
      //     this.showSplash = false;
      //   }, 3000);
      // }
    });
  }

  onSearchChange() {
    this.currentPage = 1; // Reset to first page when searching
    this.applyFiltersAndSort();
  }

  onSortChange() {
    this.currentPage = 1; // Reset to first page when sorting
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let filtered = [...this.allPaintings];

    // Apply search filter (title and artist)
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(search) || 
        p.artist?.toLowerCase().includes(search)
      );
    }

    // Apply sort
    if (this.selectedSort === 'title') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (this.selectedSort === 'artist') {
      filtered.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
    } else if (this.selectedSort === 'year') {
      filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
    }

    this.filteredPaintings = filtered;
    this.totalPages = Math.ceil(this.filteredPaintings.length / this.itemsPerPage);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    this.updateCurrentPagePaintings();
  }

  updateCurrentPagePaintings() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paintings = this.filteredPaintings.slice(startIndex, endIndex);
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateCurrentPagePaintings();
      window.scrollTo(0, 0); // Scroll to top when changing pages
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  get rows() {
    const result: any[] = [];
    for (let i = 0; i < this.paintings.length; i += 3) {
      result.push(this.paintings.slice(i, i + 3));
    }
    return result;
  }

  openInAppTab(painting: any) {
    this.router.navigate(['/paintings', painting.id]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
