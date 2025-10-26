import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GalleryService } from '../services/gallery.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, TranslatePipe],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent {
  paintings: {
    src: string;
    title: string;
    description: string;
    artist: string;
  }[] = [];

  allPaintings: any[] = []; // Store original data
  searchTerm: string = '';
  selectedFilter: string = 'all';
  selectedSort: string = 'default';

  constructor(private galleryService: GalleryService, private router: Router) {}

  ngOnInit() {
    // Fetch images from backend
    this.galleryService.getImages().subscribe((data) => {
      this.allPaintings = data.map((item: any) => ({
        id: item.id,
        src: item.url,
        title: item.title,
        description: item.description,
        artist: item.artist,
        year: item.year,
      }));
      this.paintings = [...this.allPaintings];
      this.applyFiltersAndSort();
    });
  }

  onSearchChange() {
    this.applyFiltersAndSort();
  }

  onFilterChange() {
    this.applyFiltersAndSort();
  }

  onSortChange() {
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let filtered = [...this.allPaintings];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(search) || 
        p.artist?.toLowerCase().includes(search)
      );
    }

    // Apply filter
    if (this.selectedFilter === 'recent') {
      // Filter by recent (you can customize this logic)
      filtered = filtered.slice(0, 20);
    } else if (this.selectedFilter === 'favorites') {
      // Filter favorites (placeholder - you can add favorites logic)
      filtered = filtered.slice(0, 10);
    }

    // Apply sort
    if (this.selectedSort === 'title') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (this.selectedSort === 'artist') {
      filtered.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
    } else if (this.selectedSort === 'year') {
      filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
    }

    this.paintings = filtered;
  }

  get rows() {
    const result: any[] = [];
    for (let i = 0; i < this.paintings.length; i += 3) {
      result.push(this.paintings.slice(i, i + 3));
    }
    return result;
  }

  openInAppTab(painting: any) {
    this.router.navigate(['/image', painting.id]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
