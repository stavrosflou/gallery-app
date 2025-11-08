import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GalleryService } from '../services/gallery.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredPaintings: any[] = [];
  currentSlide: number = 0;
  autoSlideInterval: any;

  constructor(
    private galleryService: GalleryService,
    private router: Router
  ) {}

  ngOnInit() {
    // Fetch random images from backend
    this.galleryService.getRandomImages().subscribe((data) => {
      this.featuredPaintings = data.map((item: any) => ({
        id: item.id,
        url: item.url,
        title: item.title,
        artist: item.artist,
      }));

      // Start auto-slide
      this.startAutoSlide();
    });
  }

  ngOnDestroy() {
    // Clear interval when component is destroyed
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 10000); // Change slide every 4 seconds
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.featuredPaintings.length;
  }

  previousSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.featuredPaintings.length) % this.featuredPaintings.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  viewPainting(id: number) {
    this.router.navigate(['/paintings', id]);
  }

  goToGallery() {
    this.router.navigate(['/paintings']);
  }
}
