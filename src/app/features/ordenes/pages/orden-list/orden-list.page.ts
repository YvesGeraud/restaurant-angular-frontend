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
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Centro de Órdenes</h2>
          <p class="text-muted">Monitoreo de pedidos en tiempo real</p>
        </div>
        <div class="d-flex gap-2">
           <button class="btn btn-light border" (click)="store.loadOrdenes()">
             <i class="bi bi-arrow-clockwise"></i>
           </button>
           <button class="btn btn-primary shadow-sm fw-bold px-4" routerLink="nueva">
             <i class="bi bi-plus-lg me-2"></i> Nueva Orden
           </button>
        </div>
      </div>

      <!-- Filtros de Estado -->
      <div class="d-flex gap-2 mb-4 overflow-auto pb-2">
        <button (click)="filtrar(undefined)" class="btn btn-sm px-4 rounded-pill" [class]="!filtroActivo() ? 'btn-primary' : 'btn-light border'">Todas</button>
        <button (click)="filtrar('PENDIENTE')" class="btn btn-sm px-4 rounded-pill" [class]="filtroActivo() === 'PENDIENTE' ? 'btn-warning' : 'btn-light border'">Pendientes</button>
        <button (click)="filtrar('EN_PROCESO')" class="btn btn-sm px-4 rounded-pill" [class]="filtroActivo() === 'EN_PROCESO' ? 'btn-info text-white' : 'btn-light border'">En Cocina</button>
        <button (click)="filtrar('LISTO')" class="btn btn-sm px-4 rounded-pill" [class]="filtroActivo() === 'LISTO' ? 'btn-success' : 'btn-light border'">Listas</button>
        <button (click)="filtrar('PAGADA')" class="btn btn-sm px-4 rounded-pill" [class]="filtroActivo() === 'PAGADA' ? 'btn-dark' : 'btn-light border'">Pagadas</button>
      </div>

      <!-- Grid de Tickets -->
      <div class="row g-4">
        <div class="col-12 col-md-6 col-lg-4 col-xl-3" *ngFor="let orden of ordenesFiltradas()">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden order-ticket" [class.border-start]="true" [ngClass]="getBorderClass(orden.estado)">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <span class="fw-bold">#ORD-{{ orden.id_rl_orden }}</span>
              <span class="badge" [ngClass]="getStatusBadgeClass(orden.estado)">{{ orden.estado }}</span>
            </div>
            
            <div class="card-body py-2">
              <div class="d-flex align-items-center gap-2 mb-3">
                <i class="bi bi-geo-alt text-primary"></i>
                <span class="fw-bold">Mesa {{ orden.id_ct_mesa || 'Para llevar' }}</span>
              </div>

              <div class="order-items mb-3">
                <div *ngFor="let item of orden.detalles" class="d-flex justify-content-between py-1 border-bottom border-light small">
                  <span>{{ item.cantidad }}x {{ item.platillo?.nombre || 'Platillo #' + item.id_ct_platillo }}</span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-3">
                <span class="text-muted small">{{ orden.fecha_reg | date:'shortTime' }}</span>
                <span class="fw-bold text-primary">{{ orden.total | currency }}</span>
              </div>
            </div>

            <div class="card-footer bg-light border-0 p-3">
              <div class="d-grid gap-2">
                <!-- Acciones dinámicas según estado -->
                <button *ngIf="orden.estado === 'PENDIENTE'" 
                        class="btn btn-primary btn-sm fw-bold" 
                        (click)="store.cambiarEstado(orden.id_rl_orden, 'EN_PROCESO')">
                  Empezar a Preparar
                </button>

                <!-- Botón Editar (Solo para PENDIENTE) -->
                <a *ngIf="orden.estado === 'PENDIENTE'" 
                   class="btn btn-light border btn-sm fw-bold" 
                   [routerLink]="['editar', orden.id_rl_orden]">
                  <i class="bi bi-pencil me-1"></i> Editar
                </a>
                
                <button *ngIf="orden.estado === 'EN_PROCESO'" 
                        class="btn btn-success btn-sm fw-bold" 
                        (click)="store.cambiarEstado(orden.id_rl_orden, 'LISTO')">
                  Marcar como Lista
                </button>

                <button *ngIf="orden.estado === 'LISTO'" 
                        class="btn btn-success btn-sm fw-bold" 
                        (click)="store.cambiarEstado(orden.id_rl_orden, 'ENTREGADO')">
                  Confirmar Entrega
                </button>

                <button *ngIf="orden.estado === 'ENTREGADO'" 
                        class="btn btn-primary btn-sm fw-bold" 
                        (click)="pagarOrden(orden)">
                  <i class="bi bi-cash-coin me-2"></i> Cerrar Cuenta / Pagar
                </button>

                <!-- Botón Cancelar -->
                <button *ngIf="orden.estado !== 'ENTREGADO' && orden.estado !== 'CANCELADO'" 
                        class="btn btn-link text-danger btn-sm text-decoration-none mt-2" 
                        (click)="cancelarOrden(orden)">
                  Cancelar Orden
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="ordenesFiltradas().length === 0 && !store.loading()" class="col-12 text-center py-5 text-muted">
           <i class="bi bi-receipt-cutoff display-1 opacity-25"></i>
           <p class="mt-3">No hay órdenes para mostrar con este filtro.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-ticket {
      border-left-width: 6px !important;
      transition: transform 0.2s;
    }
    .order-ticket:hover {
      transform: translateY(-5px);
    }
    .border-pendiente { border-left-color: #ffc107 !important; }
    .border-preparando { border-left-color: #0dcaf0 !important; }
    .border-listo { border-left-color: #198754 !important; }
    .border-entregado { border-left-color: #6c757d !important; }
    .border-cancelado { border-left-color: #dc3545 !important; }
  `]
})
export class OrdenListPage implements OnInit {
  protected readonly store = inject(OrdenesStore);
  private readonly notifications = inject(NotificationService);
  
  filtroActivo = signal<EstadoOrden | undefined>(undefined);

  // Filtro local para que desaparezcan de la vista al cambiar de estado
  ordenesFiltradas = computed(() => {
    const estado = this.filtroActivo();
    if (!estado) return this.store.ordenes();
    return this.store.ordenes().filter(o => o.estado === estado);
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
    switch(estado) {
      case 'PENDIENTE': return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'EN_PROCESO': return 'bg-info-subtle text-info border border-info-subtle';
      case 'LISTO': return 'bg-success-subtle text-success border border-success-subtle';
      case 'ENTREGADO': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'PAGADA': return 'bg-dark text-white';
      case 'CANCELADO': return 'bg-danger-subtle text-danger border border-danger-subtle';
      default: return 'bg-light';
    }
  }
  pagarOrden(orden: Orden) {
    this.notifications.confirm(
      `¿Confirmar pago de ${orden.total} para la orden #ORD-${orden.id_rl_orden}?`,
      'Cerrar Cuenta',
      'Registrar Pago'
    ).subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.store.cambiarEstado(orden.id_rl_orden, 'PAGADA');
      }
    });
  }

  cancelarOrden(orden: Orden) {
    this.notifications.confirm(
      `¿Estás seguro de cancelar la orden #ORD-${orden.id_rl_orden}?`,
      'Confirmar Cancelación',
      'Sí, cancelar'
    ).subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.store.cambiarEstado(orden.id_rl_orden, 'CANCELADO');
      }
    });
  }
}
