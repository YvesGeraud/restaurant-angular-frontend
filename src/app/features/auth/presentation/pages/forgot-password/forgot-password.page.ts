import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div class="auth-card shadow border-0 bg-white rounded-4 animate-in p-4 p-md-5" style="max-width: 460px; width: 100%">

        <!-- Logo / ícono -->
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
               style="width: 64px; height: 64px">
            <i class="bi bi-envelope-open fs-3 text-primary"></i>
          </div>
          <h1 class="h4 fw-bold mb-1">¿Olvidaste tu contraseña?</h1>
          <p class="text-muted small">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
        </div>

        <!-- Éxito -->
        @if (enviado()) {
          <div class="alert alert-success border-0 rounded-3 text-center py-4">
            <i class="bi bi-check-circle fs-2 d-block mb-2"></i>
            <p class="mb-0 fw-semibold">Si existe una cuenta con ese correo, recibirás las instrucciones en breve.</p>
          </div>
          <a routerLink="/login" class="btn btn-outline-primary w-100 rounded-3 mt-3">
            <i class="bi bi-arrow-left me-2"></i>Volver al inicio de sesión
          </a>
        } @else {
          <!-- Formulario -->
          <form #f="ngForm" (ngSubmit)="enviar(f.valid)">
            <div class="mb-4">
              <label class="form-label fw-semibold text-slate-700">Correo electrónico</label>
              <div class="input-group input-group-lg border rounded-3 overflow-hidden bg-slate-50"
                   [class.border-danger]="emailCtrl.touched && emailCtrl.invalid">
                <span class="input-group-text bg-transparent border-0 text-muted">
                  <i class="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  class="form-control bg-transparent border-0 shadow-none py-3"
                  name="email"
                  [(ngModel)]="email"
                  required
                  email
                  placeholder="tu@correo.com"
                  #emailCtrl="ngModel"
                />
              </div>
              @if (emailCtrl.touched && emailCtrl.invalid) {
                <div class="text-danger small mt-1">Ingresa un correo válido</div>
              }
            </div>

            @if (error()) {
              <div class="alert alert-danger py-2 small rounded-3">{{ error() }}</div>
            }

            <button
              type="submit"
              class="btn btn-primary w-100 py-3 rounded-3 fw-bold"
              [disabled]="cargando()"
            >
              @if (cargando()) {
                <span class="spinner-border spinner-border-sm me-2"></span>Enviando...
              } @else {
                Enviar enlace de recuperación
              }
            </button>
          </form>

          <div class="text-center mt-4">
            <a routerLink="/login" class="text-muted small text-decoration-none">
              <i class="bi bi-arrow-left me-1"></i>Volver al inicio de sesión
            </a>
          </div>
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
  `],
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);

  email = '';
  cargando = signal(false);
  enviado = signal(false);
  error = signal('');

  enviar(valid: boolean | null) {
    if (!valid) return;
    this.cargando.set(true);
    this.error.set('');

    this.authService
      .solicitarRecuperacion(this.email)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => this.enviado.set(true),
        error: () => this.error.set('Ocurrió un error. Inténtalo de nuevo más tarde.'),
      });
  }
}
