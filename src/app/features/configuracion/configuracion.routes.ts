import { Routes } from '@angular/router';

export const CONFIGURACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/configuracion-main/configuracion-main.page').then(
        (m) => m.ConfiguracionMainPage,
      ),
  },
];
