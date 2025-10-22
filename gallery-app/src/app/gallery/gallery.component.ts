import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GalleryService } from '../services/gallery.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
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

  constructor(private galleryService: GalleryService, private router: Router) {}

  ngOnInit() {
    // Fetch images from backend
    this.galleryService.getImages().subscribe((data) => {
      this.paintings = data.map((item: any) => ({
        id: item.id,
        src: item.url,
        title: item.title,
        dsescripion: item.description,
        artist: item.artist,
      }));
    });
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
