import { Routes } from '@angular/router';

export const RESERVACIONES_ROUTES: Routes = [
  {
    path: 'lista',
    loadComponent: () => import('./pages/reservacion-list/reservacion-list.page').then(m => m.ReservacionListPage)
  },
  {
    path: 'crear',
    loadComponent: () => import('./pages/reservacion-crear/reservacion-crear.page').then(m => m.ReservacionCrearPage)
  },
  {
    path: '',
    redirectTo: 'crear',
    pathMatch: 'full'
  }
];
