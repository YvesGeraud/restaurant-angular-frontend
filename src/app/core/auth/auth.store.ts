import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { User, AuthCredentials } from './auth.model';
import { catchError, finalize, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialized: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly repository = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // ── Estado ──────────────────────────────────────────────────────────────────
  private readonly state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
    isInitialized: false,
  });

  // ── Selectores públicos ─────────────────────────────────────────────────────
  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly loading = computed(() => this.state().loading);
  readonly isInitialized = computed(() => this.state().isInitialized);
  readonly userRole = computed(() => this.state().user?.rol);

  // ── Utils ───────────────────────────────────────────────────────────────────

  /** Verifica si el usuario tiene un permiso específico o al menos uno de una lista */
  hasPermission(permission: string | string[]): boolean {
    const userPerms = this.state().user?.permisos || [];
    if (Array.isArray(permission)) {
      return permission.some((p) => userPerms.includes(p));
    }
    return userPerms.includes(permission);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Intentar restaurar sesión (llamar a /me) */
  initSession(): void {
    if (this.state().isInitialized) return;

    this.state.update((s) => ({ ...s, loading: true }));
    this.repository
      .me()
      .pipe(
        tap((user) => {
          this.state.update((s) => ({ ...s, user, isAuthenticated: true }));
        }),
        catchError(() => {
          // Si /me falla (401), simplemente no hay sesión
          this.state.update((s) => ({ ...s, user: null, isAuthenticated: false }));
          return of(null);
        }),
        finalize(() => {
          this.state.update((s) => ({ ...s, loading: false, isInitialized: true }));
        }),
      )
      .subscribe();
  }

  login(credentials: AuthCredentials): void {
    this.state.update((s) => ({ ...s, loading: true }));
    this.repository
      .login(credentials)
      .pipe(
        tap((user) => {
          this.state.update((s) => ({ ...s, user, isAuthenticated: true }));
          this.router.navigate(['/admin/platillos']);
        }),
        catchError((err) => {
          const mensaje = err.error?.mensaje || 'Credenciales inválidas';
          this.notification.error(mensaje);
          return of(null);
        }),
        finalize(() => this.state.update((s) => ({ ...s, loading: false }))),
      )
      .subscribe({
        error: (err) => {
          // Evitamos que el error suba a nivel global y rompa la app/pruebas
          console.error('Error de autenticación capturado:', err);
        },
      });
  }

  /** Limpiar el estado de sesión sin llamar al backend (usado por el interceptor) */
  clearSession(): void {
    this.state.update((s) => ({
      ...s,
      user: null,
      isAuthenticated: false,
    }));
  }

  logout(): void {
    this.repository.logout().subscribe(() => {
      this.state.update((s) => ({
        ...s,
        user: null,
        isAuthenticated: false,
      }));
      this.router.navigate(['/login']);
    });
  }
}
