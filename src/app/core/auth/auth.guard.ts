import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from './auth.store';
import { filter, map, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  // Convertimos el signal a observable para manejar la espera de inicialización
  return toObservable(store.isInitialized).pipe(
    // Esperamos a que el Store haya terminado de intentar restaurar la sesión (/me)
    filter((isInitialized): isInitialized is true => !!isInitialized),
    take(1),
    map(() => {
      if (store.isAuthenticated()) {
        return true;
      }

      // Si no estÃ¡ autenticado, redirigir al login
      router.navigate(['/login']);
      return false;
    }),
  );
};

export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  // Convertimos el signal a observable para manejar la espera de inicialización
  return toObservable(store.isInitialized).pipe(
    filter((isInitialized): isInitialized is true => !!isInitialized),
    take(1),
    map(() => {
      if (!store.isAuthenticated()) {
        return true;
      }

      // Si YA está autenticado, redirigir al dashboard (platillos)
      router.navigate(['/admin/platillos']);
      return false;
    }),
  );
};
