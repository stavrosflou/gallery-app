import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GalleryComponent } from './gallery/gallery.component';
import { SingleImageComponent } from './single-image/single-image.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'paintings', component: GalleryComponent },
  { path: 'paintings/:id', component: SingleImageComponent },
];
