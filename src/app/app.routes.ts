import { Routes } from '@angular/router';
import { HomeviewComponent } from './homeview/homeview';
import { GalleryComponent } from './gallery/galery';
import { LoginPageComponent } from './auth_mac/components/login_page';
import { AuthGuard } from './auth_mac/auth_guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeviewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];




