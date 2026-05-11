import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlatillosStore } from '../../../platillos/store/platillos.store';
import { OrdenService } from '../../services/orden.service';
import { NotificationService } from '@core/services/notification.service';
import { Platillo } from '../../../platillos/models/platillo.model';

interface ItemCarrito extends Platillo {
  cantidad: number;
}

@Component({
  selector: 'app-orden-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid py-4 animate-fade-in">
      <div class="d-flex align-items-center mb-4">
        <a routerLink="/ordenes" class="btn btn-outline-secondary me-3 rounded-pill px-3 shadow-sm">
          <i class="bi bi-arrow-left me-2"></i>Volver
        </a>
        <h2 class="mb-0 fw-bold text-dark">Nueva Orden</h2>
      </div>

      <div class="row g-4">
        <!-- Panel Izquierdo: Selección de Platillos -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div class="card-header bg-white p-4 border-0">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0 text-dark">Menú Disponible</h5>
                <div class="search-box position-relative" style="width: 250px;">
                  <i
                    class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  ></i>
                  <input
                    type="text"
                    class="form-control form-control-sm border-0 bg-light ps-5 rounded-pill py-2"
                    placeholder="Buscar platillo..."
                    (input)="onBuscar($event)"
                  />
                </div>
              </div>
            </div>

            <div class="card-body p-0 overflow-auto" style="max-height: 70vh;">
              <div class="row g-0 row-cols-1 row-cols-md-2 row-cols-xl-3 p-3">
                @for (p of platillos(); track p.id) {
                  <div class="col p-2">
                    <div
                      class="platillo-card h-100 p-3 rounded-4 border transition-all hover-shadow"
                      (click)="agregarAlCarrito(p)"
                      (keydown.enter)="agregarAlCarrito(p)"
                      (keydown.space)="agregarAlCarrito(p)"
                      role="button"
                      tabindex="0"
                      [attr.aria-label]="'Agregar ' + p.nombre"
                    >
                      <div class="d-flex gap-3 align-items-center">
                        <div
                          class="img-container rounded-3 bg-light overflow-hidden"
                          style="width: 70px; height: 70px;"
                        >
                          @if (p.imagenUrl) {
                            <img
                              [src]="p.imagenUrl"
                              class="w-100 h-100 object-fit-cover"
                              [alt]="p.nombre"
                            />
                          } @else {
                            <div
                              class="w-100 h-100 d-flex align-items-center justify-content-center text-muted opacity-50"
                            >
                              <i class="bi bi-image"></i>
                            </div>
                          }
                        </div>
                        <div class="flex-grow-1 overflow-hidden">
                          <h6 class="fw-bold mb-0 text-truncate text-dark">{{ p.nombre }}</h6>
                          <span class="text-primary fw-bold small">{{
                            p.precio | currency: 'USD'
                          }}</span>
                        </div>
                        <i class="bi bi-plus-circle-fill text-primary fs-4 opacity-75"></i>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="col-12 text-center py-5 text-muted">
                    <i class="bi bi-search display-4 d-block mb-3 opacity-25"></i>
                    <p>No se encontraron platillos disponibles.</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Derecho: Carrito y Confirmación -->
        <div class="col-lg-4">
          <div
            class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden sticky-top"
            style="top: 1.5rem;"
          >
            <div class="card-body p-4 d-flex flex-column">
              <h5 class="fw-bold mb-4 text-dark">
                <i class="bi bi-cart3 me-2"></i>Resumen de la Orden
              </h5>

              <form [formGroup]="ordenForm" class="mb-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="oc_mesa" class="form-label small fw-bold text-muted text-uppercase"
                      >Seleccionar Mesa</label
                    >
                    <select
                      id="oc_mesa"
                      class="form-select border-0 bg-light py-2 rounded-3 shadow-none fw-semibold"
                      formControlName="id_ct_mesa"
                    >
                      <option [value]="null" disabled>Mesa...</option>
                      @for (m of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; track m) {
                        <option [value]="m">Mesa {{ m }}</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label
                      for="oc_personas"
                      class="form-label small fw-bold text-muted text-uppercase"
                      >Comensales</label
                    >
                    <input
                      id="oc_personas"
                      type="number"
                      class="form-control border-0 bg-light py-2 rounded-3 shadow-none fw-semibold"
                      formControlName="num_personas"
                      min="1"
                    />
                  </div>
                </div>
              </form>

              <!-- Lista de Items en Carrito -->
              <div
                class="carrito-list flex-grow-1 overflow-auto mb-4 px-1"
                style="max-height: 40vh;"
              >
                @for (item of carrito(); track item.id) {
                  <div
                    class="item-carrito p-3 rounded-4 bg-light mb-3 border-0 transition-all animate-slide-up"
                  >
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h6 class="fw-bold mb-0 text-dark">{{ item.nombre }}</h6>
                      <button
                        type="button"
                        class="btn-close small shadow-none"
                        (click)="quitarDelCarrito(item.id)"
                        aria-label="Quitar"
                      ></button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="input-group input-group-sm" style="width: 100px;">
                        <button
                          type="button"
                          class="btn btn-white border shadow-none"
                          (click)="cambiarCantidad(item.id, -1)"
                        >
                          -
                        </button>
                        <span
                          class="input-group-text bg-white border-start-0 border-end-0 fw-bold px-3"
                          >{{ item.cantidad }}</span
                        >
                        <button
                          type="button"
                          class="btn btn-white border shadow-none"
                          (click)="cambiarCantidad(item.id, 1)"
                        >
                          +
                        </button>
                      </div>
                      <span class="fw-bold text-primary">{{
                        item.precio * item.cantidad | currency: 'USD'
                      }}</span>
                    </div>
                  </div>
                } @empty {
                  <div
                    class="text-center py-5 text-muted opacity-50 bg-light rounded-4 border border-dashed"
                  >
                    <i class="bi bi-cart-x fs-1 d-block mb-2"></i>
                    <p class="small">El carrito está vacío</p>
                  </div>
                }
              </div>

              <!-- Totales y Acción -->
              <div class="border-top pt-4">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal</span>
                  <span class="fw-semibold">{{ subtotal() | currency: 'USD' }}</span>
                </div>
                <div class="d-flex justify-content-between mb-4">
                  <span class="text-dark fw-bold fs-5">Total</span>
                  <span class="text-primary fw-bold fs-5">{{ total() | currency: 'USD' }}</span>
                </div>

                <button
                  type="button"
                  class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm transition-all"
                  [disabled]="carrito().length === 0 || ordenForm.invalid"
                  (click)="confirmarOrden()"
                >
                  <i class="bi bi-check-circle me-2"></i>Confirmar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .platillo-card {
        background: #ffffff;
        border-color: #f1f5f9 !important;
        cursor: pointer;
        outline-offset: -2px;
      }
      .platillo-card:focus-visible {
        outline: 2px solid #3b82f6;
        border-color: #3b82f6 !important;
        background: #f8faff;
      }
      .platillo-card:hover {
        border-color: #3b82f6 !important;
        background: #f8faff;
        transform: scale(1.02);
      }
      .hover-shadow:hover {
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      }
      .animate-slide-up {
        animation: slideUp 0.3s ease-out;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .scrollbar-hidden::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
})
export class OrdenCrearPage implements OnInit {
  private readonly platillosStore = inject(PlatillosStore);
  private readonly ordenService = inject(OrdenService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  platillos = computed(() => this.platillosStore.platillos());
  carrito = signal<ItemCarrito[]>([]);

  ordenForm = this.fb.group({
    id_ct_mesa: [null as number | null, Validators.required],
    num_personas: [1, [Validators.required, Validators.min(1)]],
  });

  subtotal = computed(() =>
    this.carrito().reduce((acc, item) => acc + item.precio * item.cantidad, 0),
  );

  total = computed(() => this.subtotal());

  ngOnInit() {
    this.platillosStore.loadPlatillos();
  }

  onBuscar(event: Event) {
    const busqueda = (event.target as HTMLInputElement).value;
    this.platillosStore.applyFilter({ busqueda });
  }

  agregarAlCarrito(platillo: Platillo) {
    const actual = this.carrito();
    const index = actual.findIndex((i) => i.id === platillo.id);

    if (index >= 0) {
      this.cambiarCantidad(platillo.id, 1);
    } else {
      this.carrito.update((c) => [...c, { ...platillo, cantidad: 1 }]);
    }
  }

  quitarDelCarrito(id: number) {
    this.carrito.update((c) => c.filter((item) => item.id !== id));
  }

  cambiarCantidad(id: number, delta: number) {
    this.carrito.update((c) =>
      c.map((item) => {
        if (item.id === id) {
          const nuevaCantidad = Math.max(1, item.cantidad + delta);
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      }),
    );
  }

  confirmarOrden() {
    if (this.ordenForm.invalid) return;

    const payload = {
      ...this.ordenForm.value,
      detalles: this.carrito().map((i) => ({
        id_ct_platillo: i.id,
        cantidad: i.cantidad,
      })),
    };

    this.ordenService.crear(payload).subscribe({
      next: () => {
        this.notifications.success('Orden creada con éxito');
        this.router.navigate(['/ordenes']);
      },
      error: () => this.notifications.error('Error al crear la orden'),
    });
  }
}
