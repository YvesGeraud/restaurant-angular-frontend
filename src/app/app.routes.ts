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
        loadComponent: () => import('./features/public/pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/public/pages/menu/menu').then(m => m.MenuComponent)
      },
      {
        path: 'reservaciones',
        loadChildren: () => import('./features/reservaciones/reservaciones.routes').then(m => m.RESERVACIONES_ROUTES)
      }
    ]
  },

  // --- AUTH ROUTES ---
  {
    path: 'login',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/auth/presentation/pages/login_page.component').then(m => m.LoginPageComponent)
      }
    ]
  },

  // --- ADMIN ROUTES ---
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'platillos',
        pathMatch: 'full'
      },
      {
        path: 'platillos',
        loadChildren: () => import('./features/platillos/platillos.routes').then(m => m.PLATILLOS_ROUTES)
      },
      {
        path: 'mesas',
        loadChildren: () => import('./features/mesas/mesas.routes').then(m => m.MESAS_ROUTES)
      },
      {
        path: 'reservaciones',
        loadComponent: () => import('./features/reservaciones/pages/reservacion-list/reservacion-list.page').then(m => m.ReservacionListPage)
      },
      {
        path: 'ordenes',
        loadChildren: () => import('./features/ordenes/ordenes.routes').then(m => m.ORDENES_ROUTES)
      }
    ]
  },

  // --- FALLBACK ---
  {
    path: '**',
    redirectTo: ''
  }
];
