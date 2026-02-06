import { Routes } from '@angular/router';
import { HomeviewComponent } from './homeview/homeview';
import { GalleryComponent } from './gallery/galery';

export const routes: Routes = [
  {
    path: '',
    component: HomeviewComponent
  },
  {
    path: 'home',
    component: HomeviewComponent
  },
  {
    path: 'gallery',
    component: GalleryComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];




