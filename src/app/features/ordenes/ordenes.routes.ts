import { Routes } from '@angular/router';

export const ORDENES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/orden-list/orden-list.page').then(m => m.OrdenListPage)
  },
  {
    path: 'nueva',
    loadComponent: () => import('./pages/orden-crear/orden-crear.page').then(m => m.OrdenCrearPage)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./pages/orden-crear/orden-crear.page').then(m => m.OrdenCrearPage)
  }
];
