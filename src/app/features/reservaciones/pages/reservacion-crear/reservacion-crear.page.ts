import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ReservacionFormComponent } from '../../components/reservacion-form/reservacion-form.component';
import { ReservacionPagoComponent } from '../../components/reservacion-pago/reservacion-pago.component';
import { ReservacionService } from '../../services/reservacion.service';
import { ReservacionBase, Reservacion } from '../../models/reservacion.model';

@Component({
  selector: 'app-reservacion-crear-page',
  standalone: true,
  imports: [CommonModule, ReservacionFormComponent, ReservacionPagoComponent],
  template: `
    <div class="container py-5 text-white animate-fade-in">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="text-center mb-5">
            <h1 class="fw-bold" style="font-family: 'Playfair Display', serif; color: #d4af37;">
              Reserva tu Mesa
            </h1>
            <p class="text-white-50">
              Asegura tu lugar para una experiencia gastronómica inolvidable
            </p>
          </div>

          <!-- Wizard Progress -->
          <div class="d-flex justify-content-center mb-5">
            <div class="d-flex align-items-center">
              <div class="step-circle" [class.active]="step() === 1" [class.completed]="step() > 1">
                1
              </div>
              <div class="step-line" [class.active]="step() > 1"></div>
              <div class="step-circle" [class.active]="step() === 2" [class.completed]="step() > 2">
                2
              </div>
              <div class="step-line" [class.active]="step() > 2"></div>
              <div class="step-circle" [class.active]="step() === 3">3</div>
            </div>
          </div>

          <!-- Step 1: Formulario de Datos -->
          @if (step() === 1) {
            <div class="animate-slide-up">
              <app-reservacion-form
                [isSubmitting]="isSubmitting()"
                (formSubmit)="onFormSubmit($event)"
              >
              </app-reservacion-form>
            </div>
          }

          <!-- Step 2: Componente de Pago Stripe -->
          @if (step() === 2 && clientSecret()) {
            <div class="animate-slide-up">
              <app-reservacion-pago
                [clientSecret]="clientSecret()!"
                (pagoExitoso)="onPagoExitoso()"
              >
              </app-reservacion-pago>

              <div class="text-center mt-4">
                <button
                  type="button"
                  class="btn btn-outline-light rounded-pill px-4 border-secondary text-muted"
                  (click)="step.set(1)"
                  [disabled]="isSubmitting()"
                >
                  <i class="bi bi-arrow-left me-2"></i> Volver a los datos
                </button>
              </div>
            </div>
          }

          <!-- Step 3: Éxito -->
          @if (step() === 3) {
            <div
              class="card shadow-lg border-0 text-center animate-slide-up"
              style="background-color: #1e1e1e; border-radius: 2rem;"
            >
              <div class="card-body p-5">
                <div class="mb-4">
                  <i class="bi bi-check-circle-fill" style="font-size: 5rem; color: #d4af37;"></i>
                </div>
                <h2 class="mb-3 text-white fw-bold" style="font-family: 'Playfair Display', serif;">
                  ¡Reservación Confirmada!
                </h2>
                <p class="text-white-50 fs-5 mb-5 px-3">
                  Hemos enviado los detalles y el comprobante a tu correo electrónico. ¡Te esperamos
                  pronto!
                </p>
                <button
                  type="button"
                  class="btn rounded-pill px-5 py-3 fw-bold shadow-lg"
                  style="background-color: #d4af37; color: #121212;"
                  (click)="irAlInicio()"
                >
                  Regresar al Inicio
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background-color: #121212;
        min-height: calc(100vh - 150px);
      }
      .step-circle {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background-color: #1a1a1a;
        color: #6c757d;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .step-circle.active {
        background-color: #121212;
        color: #d4af37;
        border-color: #d4af37;
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        transform: scale(1.1);
      }
      .step-circle.completed {
        background-color: #d4af37;
        color: #121212;
        border-color: #d4af37;
      }
      .step-line {
        width: 60px;
        height: 2px;
        background-color: rgba(255, 255, 255, 0.1);
        margin: 0 15px;
        transition: all 0.4s ease;
      }
      .step-line.active {
        background-color: #d4af37;
      }
      .animate-fade-in {
        animation: fadeIn 0.6s ease-out;
      }
      .animate-slide-up {
        animation: slideUp 0.5s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ReservacionCrearPage {
  private readonly reservacionService = inject(ReservacionService);
  private readonly router = inject(Router);

  // Estado del Wizard
  step = signal<1 | 2 | 3>(1);
  isSubmitting = signal(false);

  // Estado de los datos
  currentReservacion = signal<Reservacion | null>(null);
  clientSecret = signal<string | null>(null);

  /**
   * Maneja el envío del formulario del Paso 1
   */
  onFormSubmit(datos: ReservacionBase) {
    this.isSubmitting.set(true);

    // 1. Crear la reservación en la base de datos
    this.reservacionService.crear(datos).subscribe({
      next: (res) => {
        this.currentReservacion.set(res.datos);

        // 2. Iniciar el pago para obtener el client_secret
        this.reservacionService
          .iniciarPago(res.datos.id_rl_reservacion, { monto_centavos: 20000, moneda: 'mxn' })
          .subscribe({
            next: (pagoRes) => {
              this.clientSecret.set(pagoRes.datos.client_secret);
              this.isSubmitting.set(false);
              this.step.set(2); // Avanzar al pago
            },
            error: (err) => {
              this.isSubmitting.set(false);
              this.mostrarError('No pudimos inicializar la pasarela de pago. Intenta nuevamente.');
              console.error('Error al inicializar pago:', err);
            },
          });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.mostrarError(err.error?.mensaje || 'Error al crear la reservación.');
        console.error('Error al crear reservación:', err);
      },
    });
  }

  /**
   * Callback cuando Stripe Elements confirma el pago con éxito
   */
  onPagoExitoso() {
    this.step.set(3); // Mostrar pantalla de éxito
  }

  irAlInicio() {
    this.router.navigate(['/']);
  }

  private mostrarError(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: mensaje,
      confirmButtonColor: '#d4af37',
    });
  }
}
