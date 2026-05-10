import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AuthStore } from '../auth/auth.store';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const forceLogout = () => {
    authStore.clearSession();
    router.navigate(['/login']);
  };

  // Forzar credentials en todas las peticiones a nuestra API
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 y no es una ruta de login (para evitar bucles)
      if (error.status === 401 && !req.url.includes('/auth/login')) {

        // Si falló el refresh, sesión expirada -> limpiar y redirigir
        if (req.url.includes('/auth/refresh')) {
          forceLogout();
          return throwError(() => error);
        }

        // Si falló /me (ej. al inicio), solo devolvemos error sin redirigir
        // para que las vistas públicas funcionen
        if (req.url.includes('/auth/me')) {
          authStore.clearSession();
          return throwError(() => error);
        }

        // Intento de Silent Refresh
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Reintentar la petición original tras el éxito del refresh
            return next(authReq);
          }),
          catchError((refreshError) => {
            // Si el refresh falla, sesión terminada -> limpiar y redirigir
            forceLogout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

