import { Routes } from '@angular/router';

export const COCINA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cocina-list/cocina-list.page').then((m) => m.CocinaListPage),
  },
];
