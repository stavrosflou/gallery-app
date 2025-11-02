import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryService } from '../services/gallery.service';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../pipes/translate.pipe';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-single-image',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PopupComponent],
  templateUrl: './single-image.component.html',
  styleUrls: ['./single-image.component.css']
})
export class SingleImageComponent implements OnInit {
  image: { id: number; src: string; title: string; description?: string; artist?: string; year?: string | number; dimensions?: string; materials?: string; width?: number; height?: number } | null = null;
  isPopupOpen = false;

  constructor(
    private route: ActivatedRoute,
    private galleryService: GalleryService,
    private location: Location
  ) {}
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (isNaN(id)) return;

      this.galleryService.getImageById(id).subscribe((item) => {
        const src = item.url ?? item.src ?? null;
        console.log('Fetched image item:', item); // Debug log
        // Normalize year (strip trailing .0 if present)
        let rawYear: any = item.year ?? item.date ?? undefined;
        let yearValue: string | number | undefined = undefined;
        if (rawYear !== undefined && rawYear !== null) {
          // convert to string then remove trailing .0
          const s = String(rawYear);
          yearValue = s.endsWith('.0') ? s.slice(0, -2) : s;
        }

        // Normalize dimensions: replace Greek 'χ' or multiplication sign with ASCII 'x'
        let rawDim: any = item.dimensions ?? item.size ?? undefined;
        let dimValue: string | undefined = undefined;
        let widthValue: number | undefined = undefined;
        let heightValue: number | undefined = undefined;
        
        if (rawDim !== undefined && rawDim !== null) {
          dimValue = String(rawDim)
            .replace(/×/g, 'x')      // Unicode multiplication sign
            .replace(/χ/g, 'x')      // Greek small letter chi
            .replace(/\s*x\s*/gi, ' x ') // normalize spacing around x
            .trim();
          
          // Parse width and height from dimensions (e.g., "100 x 80")
          const parts = dimValue.split(/\s*x\s*/i);
          if (parts.length === 2) {
            const w = parseFloat(parts[0]);
            const h = parseFloat(parts[1]);
            if (!isNaN(w) && !isNaN(h)) {
              widthValue = w;
              heightValue = h;
            }
          }
        }

        this.image = {
          id: Number(item.id),
          src,
          title: item.title ?? `Painting ${item.id}`,
          description: item.description ?? `A beautiful painting number ${item.id}.`,
          artist: item.artist ?? item.creator ?? 'Unknown artist',
          year: yearValue,
          dimensions: dimValue,
          materials: item.materials ?? undefined,
          width: widthValue,
          height: heightValue,
        };
      });
    });
  }
  isModalOpen = false;

openModal() {
    console.log('👉 openModal called'); // test

  this.isModalOpen = true;
}

closeModal() {
    console.log('👉 closeModal called'); // test

  this.isModalOpen = false;
}

goBackToPaintings() {
  this.location.back();
}

getScaledWidth(): number {
  if (!this.image?.width) return 0;
  // Scale to fit thumbnail (max 100px for larger dimension)
  const maxSize = 80;
  const ratio = this.image.height ? this.image.width / Math.max(this.image.width, this.image.height) : 1;
  return maxSize * ratio;
}

getScaledHeight(): number {
  if (!this.image?.height) return 0;
  // Scale to fit thumbnail (max 100px for larger dimension)
  const maxSize = 80;
  const ratio = this.image.width ? this.image.height / Math.max(this.image.width, this.image.height) : 1;
  return maxSize * ratio;
}

showPopup() {
  this.isPopupOpen = true;
}

closePopup() {
  this.isPopupOpen = false;
}

}
