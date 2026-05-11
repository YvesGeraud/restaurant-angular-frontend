import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdenesStore } from '../../store/ordenes.store';
import { Orden, EstadoOrden } from '../../models/orden.model';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-orden-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-4 animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1 text-dark">Centro de Órdenes</h2>
          <p class="text-muted">Monitoreo y gestión de pedidos en tiempo real</p>
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-light border rounded-circle p-2"
            (click)="store.loadOrdenes()"
            title="Refrescar lista"
          >
            <i class="bi bi-arrow-clockwise fs-5"></i>
          </button>
          <button
            type="button"
            class="btn btn-primary shadow-sm fw-bold px-4 rounded-pill"
            routerLink="nueva"
          >
            <i class="bi bi-plus-lg me-2"></i> Nueva Orden
          </button>
        </div>
      </div>

      <!-- Filtros de Estado -->
      <div class="d-flex gap-2 mb-4 overflow-auto pb-2 scrollbar-hidden">
        <button
          type="button"
          (click)="filtrar(undefined)"
          class="btn btn-sm px-4 rounded-pill fw-bold transition-all"
          [class]="!filtroActivo() ? 'btn-primary shadow-sm' : 'btn-light border'"
        >
          Todas
        </button>

        <button
          type="button"
          (click)="filtrar('PENDIENTE')"
          class="btn btn-sm px-4 rounded-pill fw-bold transition-all"
          [class]="filtroActivo() === 'PENDIENTE' ? 'btn-warning shadow-sm' : 'btn-light border'"
        >
          Pendientes
        </button>

        <button
          type="button"
          (click)="filtrar('EN_PROCESO')"
          class="btn btn-sm px-4 rounded-pill fw-bold transition-all"
          [class]="
            filtroActivo() === 'EN_PROCESO' ? 'btn-info text-white shadow-sm' : 'btn-light border'
          "
        >
          En Cocina
        </button>

        <button
          type="button"
          (click)="filtrar('LISTO')"
          class="btn btn-sm px-4 rounded-pill fw-bold transition-all"
          [class]="filtroActivo() === 'LISTO' ? 'btn-success shadow-sm' : 'btn-light border'"
        >
          Listas
        </button>

        <button
          type="button"
          (click)="filtrar('PAGADA')"
          class="btn btn-sm px-4 rounded-pill fw-bold transition-all"
          [class]="filtroActivo() === 'PAGADA' ? 'btn-dark shadow-sm' : 'btn-light border'"
        >
          Pagadas
        </button>
      </div>

      <!-- Grid de Tickets -->
      <div class="row g-4">
        @for (orden of ordenesFiltradas(); track orden.id_rl_orden) {
          <div class="col-12 col-md-6 col-lg-4 col-xl-3">
            <div
              class="card border-0 shadow-sm rounded-4 overflow-hidden order-ticket"
              [class.border-start]="true"
              [ngClass]="getBorderClass(orden.estado)"
            >
              <div
                class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center"
              >
                <span class="fw-bold text-dark">#ORD-{{ orden.id_rl_orden }}</span>
                <span
                  class="badge rounded-pill px-3 py-2 border shadow-sm"
                  [ngClass]="getStatusBadgeClass(orden.estado)"
                >
                  {{ orden.estado }}
                </span>
              </div>

              <div class="card-body py-2">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <div class="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                    <i class="bi bi-geo-alt-fill"></i>
                  </div>
                  <span class="fw-bold text-dark"
                    >Mesa {{ orden.mesa?.codigo || orden.mesa?.id_ct_mesa || 'Llevar' }}</span
                  >
                </div>

                <div class="order-items mb-3">
                  @for (item of orden.detalles; track item.id_ct_platillo) {
                    <div
                      class="d-flex justify-content-between py-2 border-bottom border-light small"
                    >
                      <span class="text-dark fw-medium">
                        <span class="badge bg-light text-dark border me-2"
                          >{{ item.cantidad }}x</span
                        >
                        {{ item.platillo?.nombre || 'Platillo #' + item.id_ct_platillo }}
                      </span>
                    </div>
                  }
                </div>

                <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span class="text-muted small"
                    ><i class="bi bi-clock me-1"></i>
                    {{ orden.fecha_reg | date: 'shortTime' }}</span
                  >
                  <span class="fw-bold text-primary fs-5">{{ orden.total | currency: 'USD' }}</span>
                </div>
              </div>

              <div class="card-footer bg-light border-0 p-3">
                <div class="d-grid gap-2">
                  <!-- Acciones dinámicas según estado -->
                  @if (orden.estado === 'PENDIENTE') {
                    <button
                      type="button"
                      class="btn btn-primary btn-sm fw-bold py-2 shadow-sm"
                      (click)="store.cambiarEstado(orden.id_rl_orden, 'EN_PROCESO')"
                    >
                      Empezar a Preparar
                    </button>
                    <a
                      class="btn btn-white border btn-sm fw-bold py-2"
                      [routerLink]="['editar', orden.id_rl_orden]"
                    >
                      <i class="bi bi-pencil me-1"></i> Editar Pedido
                    </a>
                  }

                  @if (orden.estado === 'EN_PROCESO') {
                    <button
                      type="button"
                      class="btn btn-success btn-sm fw-bold py-2 shadow-sm text-white"
                      (click)="store.cambiarEstado(orden.id_rl_orden, 'LISTO')"
                    >
                      Marcar como Lista
                    </button>
                  }

                  @if (orden.estado === 'LISTO') {
                    <button
                      type="button"
                      class="btn btn-success btn-sm fw-bold py-2 shadow-sm text-white"
                      (click)="store.cambiarEstado(orden.id_rl_orden, 'ENTREGADO')"
                    >
                      Confirmar Entrega
                    </button>
                  }

                  @if (orden.estado === 'ENTREGADO') {
                    <button
                      type="button"
                      class="btn btn-primary btn-sm fw-bold py-2 shadow-sm"
                      (click)="pagarOrden(orden)"
                    >
                      <i class="bi bi-cash-coin me-2"></i> Cerrar Cuenta / Pagar
                    </button>
                  }

                  <!-- Botón Cancelar -->
                  @if (
                    orden.estado !== 'ENTREGADO' &&
                    orden.estado !== 'CANCELADO' &&
                    orden.estado !== 'PAGADA'
                  ) {
                    <button
                      type="button"
                      class="btn btn-link text-danger btn-sm text-decoration-none mt-1 fw-semibold"
                      (click)="cancelarOrden(orden)"
                    >
                      Cancelar Orden
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <!-- Empty State -->
          @if (!store.loading()) {
            <div class="col-12 text-center py-5">
              <div class="bg-white p-5 rounded-5 shadow-sm d-inline-block border">
                <i
                  class="bi bi-receipt-cutoff display-1 text-light-gray opacity-25 mb-4 d-block"
                ></i>
                <h4 class="text-dark fw-bold">Sin órdenes registradas</h4>
                <p class="text-muted mb-0">
                  No hay pedidos para mostrar con el filtro seleccionado.
                </p>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .order-ticket {
        border-top-width: 6px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .order-ticket:hover {
        transform: translateY(-8px);
        box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1) !important;
      }
      .border-pendiente {
        border-top-color: #ffc107 !important;
      }
      .border-en_proceso {
        border-top-color: #0dcaf0 !important;
      }
      .border-listo {
        border-top-color: #198754 !important;
      }
      .border-entregado {
        border-top-color: #0d6efd !important;
      }
      .border-pagada {
        border-top-color: #212529 !important;
      }
      .border-cancelado {
        border-top-color: #dc3545 !important;
      }
      .text-light-gray {
        color: #dee2e6;
      }
      .transition-all {
        transition: all 0.2s;
      }
      .btn-white {
        background: white;
      }
      .animate-fade-in {
        animation: fadeIn 0.4s ease-out;
      }
      @keyframes fadeIn {
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
export class OrdenListPage implements OnInit {
  protected readonly store = inject(OrdenesStore);
  private readonly notifications = inject(NotificationService);

  filtroActivo = signal<EstadoOrden | undefined>(undefined);

  // Filtro local para que desaparezcan de la vista al cambiar de estado
  ordenesFiltradas = computed(() => {
    const estado = this.filtroActivo();
    if (!estado) return this.store.ordenes();
    return this.store.ordenes().filter((o) => o.estado === estado);
  });

  ngOnInit() {
    this.store.loadOrdenes();
  }

  filtrar(estado?: EstadoOrden) {
    this.filtroActivo.set(estado);
    this.store.setFiltros({ estado });
  }

  getBorderClass(estado: EstadoOrden) {
    return `border-${estado.toLowerCase()}`;
  }

  getStatusBadgeClass(estado: EstadoOrden) {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-warning-subtle text-warning border-warning-subtle';
      case 'EN_PROCESO':
        return 'bg-info-subtle text-info border-info-subtle';
      case 'LISTO':
        return 'bg-success-subtle text-success border-success-subtle';
      case 'ENTREGADO':
        return 'bg-primary-subtle text-primary border-primary-subtle';
      case 'PAGADA':
        return 'bg-dark text-white border-dark';
      case 'CANCELADO':
        return 'bg-danger-subtle text-danger border-danger-subtle';
      default:
        return 'bg-light';
    }
  }

  pagarOrden(orden: Orden) {
    this.notifications
      .confirm(
        `¿Confirmar pago para la orden #ORD-${orden.id_rl_orden}?`,
        'Cerrar Cuenta',
        'Registrar Pago',
      )
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.store.cambiarEstado(orden.id_rl_orden, 'PAGADA');
        }
      });
  }

  cancelarOrden(orden: Orden) {
    this.notifications
      .confirm(
        `¿Estás seguro de cancelar la orden #ORD-${orden.id_rl_orden}?`,
        'Confirmar Cancelación',
        'Sí, cancelar',
      )
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.store.cambiarEstado(orden.id_rl_orden, 'CANCELADO');
        }
      });
  }
}
