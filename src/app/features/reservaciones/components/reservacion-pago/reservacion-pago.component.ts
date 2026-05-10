import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { StripeService } from '../../../../core/services/stripe.service';

@Component({
  selector: 'app-reservacion-pago',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card shadow-lg border-0" style="background-color: #1e1e1e;">
      <div class="card-body p-5">
        <h3 class="mb-4 text-center text-white" style="font-family: 'Playfair Display', serif;">Datos de Tarjeta</h3>
        <p class="text-white-50 text-center mb-5">
          Autorizaremos la tarjeta para confirmar tu reservación.
          No se realizará ningún cobro hasta el día del evento.
        </p>

        <!-- Contenedor donde Stripe montará su iframe seguro -->
        <div #paymentElementContainer class="mb-4"></div>

        <!-- Alerta de error -->
        <div *ngIf="errorMessage()" class="alert alert-danger">
          {{ errorMessage() }}
        </div>

        <!-- Botón de pago -->
        <button 
          class="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center rounded-pill shadow"
          style="background-color: #d4af37; color: #121212;"
          [disabled]="isProcessing() || !isLoaded()"
          (click)="confirmarPago()"
        >
          <span *ngIf="isProcessing()" class="spinner-border spinner-border-sm me-2 text-dark" role="status" aria-hidden="true"></span>
          {{ isProcessing() ? 'Procesando...' : 'Autorizar Tarjeta' }}
        </button>
      </div>
    </div>
  `
})
export class ReservacionPagoComponent implements OnInit, OnDestroy {
  @Input({ required: true }) clientSecret!: string;
  @Output() pagoExitoso = new EventEmitter<void>();

  @ViewChild('paymentElementContainer', { static: true }) 
  paymentElementContainer!: ElementRef;

  private stripeService = inject(StripeService);
  
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  isLoaded = signal(false);
  isProcessing = signal(false);
  errorMessage = signal<string | null>(null);

  async ngOnInit() {
    try {
      this.elements = await this.stripeService.createElements(this.clientSecret);
      if (!this.elements) {
        this.errorMessage.set('Error al cargar la pasarela de pago.');
        return;
      }

      this.paymentElement = this.elements.create('payment', {
        layout: 'tabs',
      });

      this.paymentElement.mount(this.paymentElementContainer.nativeElement);
      
      this.paymentElement.on('ready', () => {
        this.isLoaded.set(true);
      });

    } catch (error) {
      console.error(error);
      this.errorMessage.set('Error al inicializar Stripe Elements.');
    }
  }

  async confirmarPago() {
    if (!this.elements) return;
    
    this.isProcessing.set(true);
    this.errorMessage.set(null);

    const stripe = await this.stripeService.getStripe();
    if (!stripe) {
      this.errorMessage.set('No se pudo conectar con Stripe.');
      this.isProcessing.set(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        // En un flujo real, aquí iría la URL a la que Stripe redirige (ej. para 3D Secure).
        // Si no queremos redirección, manejamos la respuesta en la misma página:
        // Pero Stripe requiere una return_url válida por si el banco exige 3D Secure.
      },
      // redirect: 'if_required' es crucial para SPAs (Angular) para evitar redirecciones innecesarias
      redirect: 'if_required'
    });

    if (error) {
      // El pago falló (ej. fondos insuficientes o tarjeta declinada)
      this.errorMessage.set(error.message || 'El pago fue rechazado. Intenta con otra tarjeta.');
      this.isProcessing.set(false);
    } else {
      // El pago fue exitoso (autorizado)
      this.pagoExitoso.emit();
    }
  }

  ngOnDestroy() {
    // Limpieza para evitar pérdidas de memoria al destruir el componente
    if (this.paymentElement) {
      this.paymentElement.destroy();
    }
  }
}
