import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdenesStore } from '../../../ordenes/store/ordenes.store';
import { EstadoOrden, Orden } from '../../../ordenes/models/orden.model';

@Component({
  selector: 'app-cocina-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4 h-100 bg-light-gray animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-0 text-dark">Monitor de Cocina (KDS)</h2>
          <p class="text-muted">Control de órdenes activas para preparación inmediata</p>
        </div>
        <div class="d-flex gap-3">
          <div
            class="badge bg-warning text-dark p-2 px-3 rounded-pill shadow-sm border border-warning-subtle"
          >
            <i class="bi bi-clock me-1"></i> {{ pendientes().length }} Pendientes
          </div>
          <div
            class="badge bg-primary text-white p-2 px-3 rounded-pill shadow-sm border border-primary"
          >
            <i class="bi bi-fire me-1"></i> {{ enProceso().length }} En Proceso
          </div>
        </div>
      </div>

      <!-- Grid de Órdenes -->
      <div class="row g-4">
        @for (orden of ordenesActivas(); track orden.id_rl_orden) {
          <div class="col-md-6 col-lg-4 col-xl-3">
            <div
              class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden kds-card"
              [ngClass]="{
                'border-top border-5 border-warning': orden.estado === 'PENDIENTE',
                'border-top border-5 border-primary': orden.estado === 'EN_PROCESO',
                'border-top border-5 border-success': orden.estado === 'LISTO',
              }"
            >
              <div
                class="card-header bg-white border-0 p-3 d-flex justify-content-between align-items-start"
              >
                <div>
                  <span class="d-block fw-bold fs-5 text-dark"
                    >Mesa {{ orden.mesa?.codigo || orden.mesa?.id_ct_mesa || 'N/A' }}</span
                  >
                  <span class="text-muted small"
                    >#{{ orden.id_rl_orden }} - {{ orden.fecha_reg | date: 'shortTime' }}</span
                  >
                </div>
                <span
                  class="badge rounded-pill px-3 py-2"
                  [ngClass]="{
                    'bg-warning-subtle text-warning border border-warning-subtle':
                      orden.estado === 'PENDIENTE',
                    'bg-primary-subtle text-primary border border-primary-subtle':
                      orden.estado === 'EN_PROCESO',
                    'bg-success-subtle text-success border border-success-subtle':
                      orden.estado === 'LISTO',
                  }"
                  >{{ orden.estado }}</span
                >
              </div>

              <div class="card-body p-3 pt-0">
                <hr class="mt-0 mb-3 opacity-10" />
                <ul class="list-unstyled mb-0">
                  @for (item of orden.detalles; track item.id_ct_platillo) {
                    <li class="mb-3 d-flex align-items-start gap-3">
                      <span
                        class="badge bg-dark rounded-pill d-flex align-items-center justify-content-center"
                        style="min-width: 28px; height: 28px;"
                      >
                        {{ item.cantidad }}
                      </span>
                      <div>
                        <span class="fw-bold text-dark d-block">{{ item.platillo?.nombre }}</span>
                      </div>
                    </li>
                  }
                </ul>
              </div>

              <div class="card-footer bg-white border-0 p-3 mt-auto">
                <div class="d-grid gap-2">
                  @if (orden.estado === 'PENDIENTE') {
                    <button
                      type="button"
                      (click)="cambiarEstado(orden.id_rl_orden, 'EN_PROCESO')"
                      class="btn btn-primary rounded-3 fw-bold py-2 shadow-sm"
                    >
                      <i class="bi bi-play-fill me-1"></i> Empezar Cocina
                    </button>
                  }

                  @if (orden.estado === 'EN_PROCESO') {
                    <button
                      type="button"
                      (click)="cambiarEstado(orden.id_rl_orden, 'LISTO')"
                      class="btn btn-success rounded-3 fw-bold py-2 shadow-sm text-white"
                    >
                      <i class="bi bi-check-all me-1"></i> ¡Listo para Servir!
                    </button>
                  }

                  @if (orden.estado === 'LISTO') {
                    <div
                      class="text-center text-success fw-bold py-2 bg-success-subtle rounded-3 border border-success-subtle animate-pulse"
                    >
                      <i class="bi bi-clock-history me-1"></i> Esperando Entrega
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <!-- Empty State -->
          <div class="col-12 text-center py-5">
            <div class="bg-white p-5 rounded-5 shadow-sm d-inline-block animate-fade-in border">
              <i class="bi bi-cup-hot display-1 text-light-gray mb-4 d-block"></i>
              <h3 class="text-dark fw-bold">Cocina Despejada</h3>
              <p class="text-muted mb-0 mx-auto" style="max-width: 300px;">
                No hay órdenes pendientes por ahora. ¡Buen trabajo!
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .bg-light-gray {
        background-color: #f4f6f9;
        min-height: calc(100vh - 60px);
      }
      .kds-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .kds-card:hover {
        transform: translateY(-5px);
        shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
      }
      .bg-warning-subtle {
        background-color: #fff3cd;
      }
      .bg-primary-subtle {
        background-color: #cfe2ff;
      }
      .bg-success-subtle {
        background-color: #d1e7dd;
      }
      .text-light-gray {
        color: #dee2e6;
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
      }
      .animate-pulse {
        animation: pulse 2s infinite;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
        100% {
          opacity: 1;
        }
      }
    `,
  ],
})
export class CocinaListPage implements OnInit {
  private readonly store = inject(OrdenesStore);

  // Filtramos solo lo que le interesa a cocina
  readonly ordenesActivas = computed(() =>
    this.store
      .ordenes()
      .filter((o: Orden) => ['PENDIENTE', 'EN_PROCESO', 'LISTO'].includes(o.estado)),
  );

  readonly pendientes = computed(() =>
    this.ordenesActivas().filter((o: Orden) => o.estado === 'PENDIENTE'),
  );

  readonly enProceso = computed(() =>
    this.ordenesActivas().filter((o: Orden) => o.estado === 'EN_PROCESO'),
  );

  ngOnInit() {
    // Aseguramos que las órdenes estén cargadas
    this.store.setFiltros({ limite: 50, estado: undefined });
    this.store.loadOrdenes();
  }

  cambiarEstado(id: number, nuevoEstado: string) {
    this.store.cambiarEstado(id, nuevoEstado as EstadoOrden);
  }
}
