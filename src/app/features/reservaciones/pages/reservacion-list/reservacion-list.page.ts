import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservacionService } from '../../services/reservacion.service';
import { Reservacion } from '../../models/reservacion.model';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-reservacion-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4 animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1 fw-bold text-dark">Gestión de Reservaciones</h2>
          <p class="text-muted">Control de asistencia y estado de mesas en tiempo real</p>
        </div>
        <button
          type="button"
          class="btn btn-outline-primary rounded-pill px-4 fw-bold"
          (click)="cargarReservaciones()"
        >
          <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
        </button>
      </div>

      <!-- Barra de Filtros Rápidos -->
      <div class="d-flex gap-2 mb-4">
        <button
          type="button"
          class="btn btn-sm btn-light border px-4 rounded-pill active shadow-sm"
        >
          Todas
        </button>
        <button type="button" class="btn btn-sm btn-light border px-4 rounded-pill shadow-sm">
          Hoy
        </button>
        <button type="button" class="btn btn-sm btn-light border px-4 rounded-pill shadow-sm">
          Pendientes
        </button>
      </div>

      <!-- Data Table -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="text-muted small fw-bold text-uppercase tracking-wider">
                <th scope="col" class="py-3 px-4">Fecha y Hora</th>
                <th scope="col" class="py-3">Cliente / Mesa</th>
                <th scope="col" class="py-3">Personas</th>
                <th scope="col" class="py-3">Estado</th>
                <th scope="col" class="py-3 px-4 text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Cargando -->
              @if (isLoading()) {
                <tr>
                  <td colspan="5" class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <p class="text-muted mb-0">Sincronizando reservaciones...</p>
                  </td>
                </tr>
              } @else {
                <!-- Registros Reales -->
                @for (res of reservaciones(); track res.id_rl_reservacion) {
                  <tr>
                    <td class="px-4">
                      <div class="fw-bold text-dark">
                        {{ res.fecha_reservacion | date: 'dd/MM/yyyy' }}
                      </div>
                      <div class="small text-muted">
                        {{ res.fecha_reservacion | date: 'shortTime' }}
                      </div>
                    </td>
                    <td>
                      <div class="fw-medium">Cliente #{{ res.id_ct_cliente }}</div>
                      <div class="small text-primary fw-bold">Mesa #{{ res.id_ct_mesa }}</div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border px-3 py-2 rounded-pill">
                        <i class="bi bi-people me-1"></i> {{ res.num_personas }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="badge rounded-pill px-3 py-2 border shadow-sm"
                        [ngClass]="{
                          'bg-warning-subtle text-warning border-warning-subtle':
                            res.id_ct_estado_reservacion === 1,
                          'bg-success-subtle text-success border-success-subtle':
                            res.id_ct_estado_reservacion === 2,
                          'bg-info-subtle text-info border-info-subtle':
                            res.id_ct_estado_reservacion === 3,
                          'bg-secondary-subtle text-secondary border-secondary-subtle':
                            res.id_ct_estado_reservacion === 4,
                          'bg-danger-subtle text-danger border-danger-subtle':
                            res.id_ct_estado_reservacion === 5,
                          'bg-dark text-white border-dark': res.id_ct_estado_reservacion === 6,
                        }"
                      >
                        <i
                          class="bi me-1"
                          [ngClass]="{
                            'bi-hourglass-split': res.id_ct_estado_reservacion === 1,
                            'bi-calendar-check': res.id_ct_estado_reservacion === 2,
                            'bi-check2-all': res.id_ct_estado_reservacion === 3,
                            'bi-person-x': res.id_ct_estado_reservacion === 4,
                            'bi-x-circle': res.id_ct_estado_reservacion === 5,
                            'bi-shield-exclamation': res.id_ct_estado_reservacion === 6,
                          }"
                        ></i>
                        {{ getEstadoTexto(res.id_ct_estado_reservacion) }}
                      </span>
                    </td>
                    <td class="px-4 text-end">
                      <div class="btn-group shadow-sm rounded-3 overflow-hidden border">
                        @if (res.id_ct_estado_reservacion === 2) {
                          <button
                            type="button"
                            class="btn btn-sm btn-white border-0 py-2 px-3 text-success"
                            (click)="confirmarAsistencia(res)"
                            title="Confirmar Asistencia"
                          >
                            <i class="bi bi-person-check fs-6"></i>
                          </button>
                          <button
                            type="button"
                            class="btn btn-sm btn-white border-0 py-2 px-3 text-warning"
                            (click)="marcarNoShow(res)"
                            title="No se presentó"
                          >
                            <i class="bi bi-person-x fs-6"></i>
                          </button>
                        }
                        <button
                          type="button"
                          class="btn btn-sm btn-white border-0 py-2 px-3 text-danger"
                          (click)="eliminarReservacion(res)"
                          title="Cancelar reservación"
                        >
                          <i class="bi bi-trash fs-6"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <!-- Lista Vacía -->
                  <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                      <i class="bi bi-calendar-x display-4 d-block mb-3 opacity-25"></i>
                      <h5 class="fw-bold">Sin reservaciones</h5>
                      <p class="mb-0">No hay registros que coincidan con los filtros actuales.</p>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background-color: #f8f9fa;
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
      .tracking-wider {
        letter-spacing: 0.05em;
      }
      .btn-white {
        background: white;
      }
      .btn-white:hover {
        background: #f8f9fa;
      }
    `,
  ],
})
export class ReservacionListPage implements OnInit {
  private readonly reservacionService = inject(ReservacionService);
  private readonly notifications = inject(NotificationService);

  reservaciones = signal<Reservacion[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.cargarReservaciones();
  }

  cargarReservaciones() {
    this.isLoading.set(true);
    this.reservacionService.obtenerTodas().subscribe({
      next: (res) => {
        this.reservaciones.set(res.datos);
        this.isLoading.set(false);
      },
      error: () => {
        this.notifications.error('Error al cargar la lista de reservaciones');
        this.isLoading.set(false);
      },
    });
  }

  confirmarAsistencia(res: Reservacion) {
    this.notifications.success(`Cliente de la mesa #${res.id_ct_mesa} marcado como presente.`);
    // TODO: Implementar llamada al API para cambiar estado a "Completada/Presente"
  }

  marcarNoShow(res: Reservacion) {
    this.notifications
      .confirm(
        `¿Marcar la reservación #${res.id_rl_reservacion} como "No se presentó"?`,
        'Confirmar No-Show',
        'Sí, marcar',
      )
      .subscribe((confirmado) => {
        if (confirmado) {
          this.notifications.info('Estado actualizado.');
        }
      });
  }

  eliminarReservacion(res: Reservacion) {
    this.notifications
      .confirm(
        `¿Estás seguro de que deseas cancelar definitivamente la reservación de la mesa #${res.id_ct_mesa}?`,
        'Cancelar Reservación',
        'Sí, cancelar',
      )
      .subscribe((confirmado) => {
        if (confirmado) {
          this.reservacionService.eliminar(res.id_rl_reservacion).subscribe({
            next: () => {
              this.notifications.success('Reservación cancelada correctamente');
              this.cargarReservaciones(); // Recargar lista
            },
            error: () => this.notifications.error('Error al intentar cancelar la reservación'),
          });
        }
      });
  }

  getEstadoTexto(id: number): string {
    const estados: Record<number, string> = {
      1: 'Pendiente Pago',
      2: 'Confirmada',
      3: 'Completada',
      4: 'No Se Presentó',
      5: 'Cancelada',
      6: 'Cancelada con Cargo',
    };
    return estados[id] || 'Desconocido';
  }
}
