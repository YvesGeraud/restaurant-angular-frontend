import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  StripeElements,
  StripePaymentElement,
  StripePaymentElementOptions,
} from '@stripe/stripe-js';
import { StripeService } from '../../../../core/services/stripe.service';

@Component({
  selector: 'app-reservacion-pago',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card shadow-lg border-0 animate-slide-up"
      style="background-color: #1e1e1e; border-radius: 1.5rem;"
    >
      <div class="card-body p-4 p-md-5">
        <h3
          class="mb-4 text-center text-white fw-bold"
          style="font-family: 'Playfair Display', serif;"
        >
          Confirmación de Reserva
        </h3>
        <p class="text-white-50 text-center mb-5 px-lg-3">
          Autorizaremos la tarjeta para confirmar tu reservación de forma segura.
          <span class="d-block mt-2 small fst-italic"
            >Solo se realizará un cargo en caso de cancelación tardía o inasistencia.</span
          >
        </p>

        <!-- Contenedor donde Stripe montará su iframe seguro -->
        <div #paymentElementContainer class="mb-4 stripe-container p-3 rounded-3 bg-white"></div>

        <!-- Alerta de error -->
        @if (errorMessage()) {
          <div class="alert alert-danger border-0 shadow-sm animate-fade-in" role="alert">
            <i class="bi bi-exclamation-circle me-2"></i> {{ errorMessage() }}
          </div>
        }

        <!-- Botón de pago -->
        <button
          type="button"
          class="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center rounded-pill shadow-lg transition-all"
          style="background-color: #d4af37; color: #121212;"
          [disabled]="isProcessing() || !isLoaded()"
          (click)="confirmarPago()"
        >
          @if (isProcessing()) {
            <span
              class="spinner-border spinner-border-sm me-2 text-dark"
              role="status"
              aria-hidden="true"
            ></span>
            <span>Procesando...</span>
          } @else {
            <span>Autorizar con Seguridad</span>
          }
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .stripe-container {
        transition: all 0.3s ease;
        min-height: 200px;
      }
      .transition-all {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .transition-all:hover:not(:disabled) {
        transform: translateY(-2px);
        opacity: 0.9;
      }
      .animate-slide-up {
        animation: slideUp 0.5s ease-out;
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
export class ReservacionPagoComponent implements OnInit, OnDestroy {
  @Input({ required: true }) clientSecret!: string;
  @Output() pagoExitoso = new EventEmitter<void>();

  @ViewChild('paymentElementContainer', { static: true })
  paymentElementContainer!: ElementRef;

  private readonly stripeService = inject(StripeService);

  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  isLoaded = signal(false);
  isProcessing = signal(false);
  errorMessage = signal<string | null>(null);

  async ngOnInit() {
    try {
      this.elements = await this.stripeService.createElements(this.clientSecret);
      if (!this.elements) {
        this.errorMessage.set('No se pudo establecer conexión con el proveedor de pagos.');
        return;
      }

      this.paymentElement = this.elements.create('payment', {
        layout: 'tabs',
        theme: 'night', // Tema oscuro para que combine con el diseño
      } as StripePaymentElementOptions);

      if (this.paymentElement) {
        this.paymentElement.mount(this.paymentElementContainer.nativeElement);

        this.paymentElement.on('ready', () => {
          this.isLoaded.set(true);
        });
      }
    } catch (error) {
      console.error('Error al inicializar Stripe Elements:', error);
      this.errorMessage.set('Error al inicializar la pasarela de pago segura.');
    }
  }

  async confirmarPago() {
    if (!this.elements) return;

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    const stripe = await this.stripeService.getStripe();
    if (!stripe) {
      this.errorMessage.set('Error de conexión con el servidor de pagos.');
      this.isProcessing.set(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        // Redirección si es requerido por el banco (3D Secure)
      },
      redirect: 'if_required',
    });

    if (error) {
      this.errorMessage.set(
        error.message || 'La tarjeta fue rechazada. Por favor, intenta con otra.',
      );
      this.isProcessing.set(false);
    } else {
      this.pagoExitoso.emit();
    }
  }

  ngOnDestroy() {
    if (this.paymentElement) {
      this.paymentElement.destroy();
    }
  }
}
