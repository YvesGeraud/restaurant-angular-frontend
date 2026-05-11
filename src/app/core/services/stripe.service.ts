import { Injectable, signal } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  // Manejamos la instancia de Stripe usando Signals para reactividad
  private stripeInstance = signal<Stripe | null>(null);

  // Guardamos la promesa de inicialización para evitar múltiples cargas
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    // Inicializamos Stripe de inmediato al crear el servicio
    this.stripePromise = loadStripe(environment.stripePublicKey);
    this.stripePromise.then((stripe) => {
      if (stripe) {
        this.stripeInstance.set(stripe);
      } else {
        console.error('No se pudo inicializar Stripe. Revisa la clave pública en environment.ts');
      }
    });
  }

  /**
   * Obtiene la instancia de Stripe. Si aún no carga, espera a la promesa.
   */
  async getStripe(): Promise<Stripe | null> {
    const instance = this.stripeInstance();
    if (instance) return instance;
    return await this.stripePromise;
  }

  /**
   * Crea una instancia de Stripe Elements con el clientSecret del PaymentIntent
   * Esto es necesario para montar el componente de Pago.
   */
  async createElements(clientSecret: string): Promise<StripeElements | null> {
    const stripe = await this.getStripe();
    if (!stripe) return null;

    return stripe.elements({
      clientSecret,
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#d4af37', // Gold
          colorBackground: '#1a1a1a', // Dark grey
          colorText: '#ffffff',
          colorDanger: '#ef4444',
          fontFamily: '"Outfit", system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
      },
    });
  }
}
