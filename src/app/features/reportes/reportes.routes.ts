import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reportes-list/reportes-list.page').then((m) => m.ReportesListPage),
  },
];
