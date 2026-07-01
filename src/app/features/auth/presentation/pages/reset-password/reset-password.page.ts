import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div class="auth-card shadow border-0 bg-white rounded-4 animate-in p-4 p-md-5" style="max-width: 460px; width: 100%">

        <!-- Ícono -->
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
               style="width: 64px; height: 64px">
            <i class="bi bi-key fs-3 text-primary"></i>
          </div>
          <h1 class="h4 fw-bold mb-1">Nueva contraseña</h1>
          <p class="text-muted small">Elige una contraseña segura para tu cuenta.</p>
        </div>

        <!-- Token inválido -->
        @if (!token()) {
          <div class="alert alert-danger text-center rounded-3">
            <i class="bi bi-exclamation-triangle fs-4 d-block mb-2"></i>
            El enlace de recuperación es inválido o ya fue utilizado.
          </div>
          <a routerLink="/forgot-password" class="btn btn-outline-primary w-100 rounded-3 mt-3">
            Solicitar un nuevo enlace
          </a>
        }

        <!-- Éxito -->
        @else if (exitoso()) {
          <div class="alert alert-success border-0 rounded-3 text-center py-4">
            <i class="bi bi-shield-check fs-2 d-block mb-2"></i>
            <p class="mb-0 fw-semibold">¡Contraseña actualizada! Ya puedes iniciar sesión con tu nueva contraseña.</p>
          </div>
          <a routerLink="/login" class="btn btn-primary w-100 rounded-3 mt-3 fw-bold">
            <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
          </a>
        }

        <!-- Formulario -->
        @else {
          <form #f="ngForm" (ngSubmit)="resetear(f.valid)">
            <!-- Nueva contraseña -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Nueva contraseña</label>
              <div class="input-group input-group-lg border rounded-3 overflow-hidden bg-slate-50"
                   [class.border-danger]="nuevaCtrl.touched && nuevaCtrl.invalid">
                <span class="input-group-text bg-transparent border-0 text-muted">
                  <i class="bi bi-lock"></i>
                </span>
                <input
                  [type]="mostrarNueva() ? 'text' : 'password'"
                  class="form-control bg-transparent border-0 shadow-none py-3"
                  name="contrasena_nueva"
                  [(ngModel)]="contrasena_nueva"
                  required
                  minlength="8"
                  maxlength="100"
                  placeholder="Mínimo 8 caracteres"
                  #nuevaCtrl="ngModel"
                />
                <button type="button" class="input-group-text bg-transparent border-0 text-muted shadow-none"
                        (click)="mostrarNueva.set(!mostrarNueva())">
                  <i [class]="mostrarNueva() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              @if (nuevaCtrl.touched && nuevaCtrl.invalid) {
                <div class="text-danger small mt-1">Mínimo 8 caracteres</div>
              }
            </div>

            <!-- Confirmar contraseña -->
            <div class="mb-4">
              <label class="form-label fw-semibold">Confirmar contraseña</label>
              <input
                type="password"
                class="form-control form-control-lg rounded-3 bg-slate-50 border"
                name="confirmar"
                [(ngModel)]="confirmar"
                required
                placeholder="Repite la contraseña"
                #confirmarCtrl="ngModel"
                [class.is-invalid]="confirmarCtrl.touched && contrasena_nueva !== confirmar"
              />
              @if (confirmarCtrl.touched && contrasena_nueva !== confirmar) {
                <div class="invalid-feedback">Las contraseñas no coinciden</div>
              }
            </div>

            @if (error()) {
              <div class="alert alert-danger py-2 small rounded-3">{{ error() }}</div>
            }

            <button
              type="submit"
              class="btn btn-primary w-100 py-3 rounded-3 fw-bold"
              [disabled]="cargando() || contrasena_nueva !== confirmar"
            >
              @if (cargando()) {
                <span class="spinner-border spinner-border-sm me-2"></span>Guardando...
              } @else {
                Establecer nueva contraseña
              }
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      background-color: #f8fafc;
      background-image: radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%);
    }
    .animate-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .bg-slate-50 { background-color: #f8fafc; }
  `],
})
export class ResetPasswordPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  token = signal('');
  contrasena_nueva = '';
  confirmar = '';
  mostrarNueva = signal(false);
  cargando = signal(false);
  exitoso = signal(false);
  error = signal('');

  ngOnInit() {
    const t = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.token.set(t);
  }

  resetear(valid: boolean | null) {
    if (!valid || this.contrasena_nueva !== this.confirmar) return;
    this.cargando.set(true);
    this.error.set('');

    this.authService
      .resetearContrasena(this.token(), this.contrasena_nueva, this.confirmar)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => this.exitoso.set(true),
        error: (err) => {
          const msg = err?.error?.mensaje || 'El enlace es inválido o ha expirado.';
          this.error.set(msg);
        },
      });
  }
}
