import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/usuario-list/usuario-list.page').then((m) => m.UsuarioListPage),
  },
];
