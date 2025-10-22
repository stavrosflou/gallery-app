import { Routes } from '@angular/router';
import { GalleryComponent } from './gallery/gallery.component';
import { SingleImageComponent } from './single-image/single-image.component';

export const routes: Routes = [
  { path: '', component: GalleryComponent },
  { path: 'image/:id', component: SingleImageComponent },
];
