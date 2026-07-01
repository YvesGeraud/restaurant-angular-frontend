import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container py-4 animate-fade-in" style="max-width: 520px">
      <div class="mb-4">
        <h2 class="fw-bold mb-1">Cambiar contraseña</h2>
        <p class="text-muted">Actualiza la contraseña de tu cuenta. Se cerrarán todas tus sesiones activas.</p>
      </div>

      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <form #f="ngForm" (ngSubmit)="cambiar(f.valid)">
            <!-- Contraseña actual -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">Contraseña actual</label>
              <div class="input-group border rounded-3 overflow-hidden"
                   [class.border-danger]="actualCtrl.touched && actualCtrl.invalid">
                <span class="input-group-text bg-white border-0 text-muted"><i class="bi bi-lock"></i></span>
                <input
                  [type]="mostrarActual() ? 'text' : 'password'"
                  class="form-control border-0 shadow-none"
                  name="contrasena_actual"
                  [(ngModel)]="contrasena_actual"
                  required
                  minlength="8"
                  placeholder="Tu contraseña actual"
                  #actualCtrl="ngModel"
                />
                <button type="button" class="btn btn-link border-0 text-muted px-3 shadow-none"
                        (click)="mostrarActual.set(!mostrarActual())">
                  <i [class]="mostrarActual() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <hr class="my-3 opacity-10" />

            <!-- Nueva contraseña -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">Nueva contraseña</label>
              <div class="input-group border rounded-3 overflow-hidden"
                   [class.border-danger]="nuevaCtrl.touched && nuevaCtrl.invalid">
                <span class="input-group-text bg-white border-0 text-muted"><i class="bi bi-key"></i></span>
                <input
                  [type]="mostrarNueva() ? 'text' : 'password'"
                  class="form-control border-0 shadow-none"
                  name="contrasena_nueva"
                  [(ngModel)]="contrasena_nueva"
                  required
                  minlength="8"
                  maxlength="100"
                  placeholder="Mínimo 8 caracteres"
                  #nuevaCtrl="ngModel"
                />
                <button type="button" class="btn btn-link border-0 text-muted px-3 shadow-none"
                        (click)="mostrarNueva.set(!mostrarNueva())">
                  <i [class]="mostrarNueva() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              @if (nuevaCtrl.touched && nuevaCtrl.invalid) {
                <div class="text-danger small mt-1">Mínimo 8 caracteres</div>
              }
            </div>

            <!-- Confirmar -->
            <div class="mb-4">
              <label class="form-label fw-semibold small">Confirmar nueva contraseña</label>
              <input
                type="password"
                class="form-control rounded-3 border"
                name="confirmar"
                [(ngModel)]="confirmar"
                required
                placeholder="Repite la nueva contraseña"
                #confirmarCtrl="ngModel"
                [class.is-invalid]="confirmarCtrl.touched && contrasena_nueva !== confirmar"
              />
              @if (confirmarCtrl.touched && contrasena_nueva !== confirmar) {
                <div class="invalid-feedback">Las contraseñas no coinciden</div>
              }
            </div>

            @if (error()) {
              <div class="alert alert-danger py-2 small rounded-3 mb-3">{{ error() }}</div>
            }

            <div class="d-flex gap-2 justify-content-end">
              <a routerLink="/admin/dashboard" class="btn btn-light rounded-pill px-4">Cancelar</a>
              <button
                type="submit"
                class="btn btn-primary rounded-pill px-4 fw-bold"
                [disabled]="cargando() || contrasena_nueva !== confirmar"
              >
                @if (cargando()) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                }
                Actualizar contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #f8f9fa; min-height: 100vh; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ChangePasswordPage {
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  contrasena_actual = '';
  contrasena_nueva = '';
  confirmar = '';
  mostrarActual = signal(false);
  mostrarNueva = signal(false);
  cargando = signal(false);
  error = signal('');

  cambiar(valid: boolean | null) {
    if (!valid || this.contrasena_nueva !== this.confirmar) return;
    this.cargando.set(true);
    this.error.set('');

    this.authService
      .cambiarContrasena(this.contrasena_actual, this.contrasena_nueva, this.confirmar)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Contraseña actualizada. Inicia sesión nuevamente.');
          void this.router.navigate(['/login']);
        },
        error: (err) => {
          const msg = err?.error?.mensaje || 'La contraseña actual es incorrecta.';
          this.error.set(msg);
        },
      });
  }
}
