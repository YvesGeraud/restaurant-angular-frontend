import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
  // --- PUBLIC ROUTES ---
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./features/public/pages/menu/menu').then((m) => m.MenuComponent),
      },
      {
        path: 'reservaciones',
        loadChildren: () =>
          import('./features/reservaciones/reservaciones.routes').then(
            (m) => m.RESERVACIONES_ROUTES,
          ),
      },
    ],
  },

  // --- AUTH ROUTES ---
  {
    path: 'login',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/presentation/pages/login_page.component').then(
            (m) => m.LoginPageComponent,
          ),
      },
    ],
  },
  {
    path: 'forgot-password',
    component: AuthLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/presentation/pages/forgot-password/forgot-password.page').then(
            (m) => m.ForgotPasswordPage,
          ),
      },
    ],
  },
  {
    path: 'reset-password',
    component: AuthLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/presentation/pages/reset-password/reset-password.page').then(
            (m) => m.ResetPasswordPage,
          ),
      },
    ],
  },

  // --- ADMIN ROUTES ---
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
      },
      {
        path: 'platillos',
        loadChildren: () =>
          import('./features/platillos/platillos.routes').then((m) => m.PLATILLOS_ROUTES),
      },
      {
        path: 'mesas',
        loadChildren: () => import('./features/mesas/mesas.routes').then((m) => m.MESAS_ROUTES),
      },
      {
        path: 'reservaciones',
        loadComponent: () =>
          import('./features/reservaciones/pages/reservacion-list/reservacion-list.page').then(
            (m) => m.ReservacionListPage,
          ),
      },
      {
        path: 'ordenes',
        loadChildren: () =>
          import('./features/ordenes/ordenes.routes').then((m) => m.ORDENES_ROUTES),
      },
      {
        path: 'cocina',
        loadChildren: () => import('./features/cocina/cocina.routes').then((m) => m.COCINA_ROUTES),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
      },
      {
        path: 'configuracion',
        loadChildren: () =>
          import('./features/configuracion/configuracion.routes').then(
            (m) => m.CONFIGURACION_ROUTES,
          ),
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import(
            './features/auth/presentation/pages/change-password/change-password.page'
          ).then((m) => m.ChangePasswordPage),
      },
    ],
  },

  // --- FALLBACK ---
  {
    path: '**',
    redirectTo: '',
  },
];
