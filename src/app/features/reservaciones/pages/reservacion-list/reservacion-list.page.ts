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
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1 fw-bold">Gestión de Reservaciones</h2>
          <p class="text-muted">Control de asistencia y estado de mesas</p>
        </div>
        <button class="btn btn-outline-primary" (click)="cargarReservaciones()">
          <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
        </button>
      </div>

      <!-- Barra de Filtros Rápidos -->
      <div class="d-flex gap-2 mb-4">
        <button class="btn btn-sm btn-light border px-3 rounded-pill active">Todas</button>
        <button class="btn btn-sm btn-light border px-3 rounded-pill">Hoy</button>
        <button class="btn btn-sm btn-light border px-3 rounded-pill">Pendientes</button>
      </div>

      <!-- Data Table -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" class="py-3 px-4 text-muted small fw-bold text-uppercase">Fecha y Hora</th>
                <th scope="col" class="py-3 text-muted small fw-bold text-uppercase">Cliente / Mesa</th>
                <th scope="col" class="py-3 text-muted small fw-bold text-uppercase">Personas</th>
                <th scope="col" class="py-3 text-muted small fw-bold text-uppercase">Estado</th>
                <th scope="col" class="py-3 px-4 text-end text-muted small fw-bold text-uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Cargando -->
              <tr *ngIf="isLoading()">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="mt-2 text-muted mb-0">Cargando reservaciones...</p>
                </td>
              </tr>

              <!-- Lista Vacía -->
              <tr *ngIf="!isLoading() && reservaciones().length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="bi bi-calendar-x display-4 d-block mb-3 opacity-50"></i>
                  <p class="mb-0">No hay reservaciones registradas por el momento.</p>
                </td>
              </tr>

              <!-- Registros Reales -->
              <tr *ngFor="let res of reservaciones()">
                <td class="px-4">
                  <div class="fw-bold">{{ res.fecha_reservacion | date:'dd/MM/yyyy' }}</div>
                  <div class="small text-muted">{{ res.fecha_reservacion | date:'shortTime' }}</div>
                </td>
                <td>
                  <div class="fw-medium">Cliente #{{ res.id_ct_cliente }}</div>
                  <div class="small text-primary">Mesa #{{ res.id_ct_mesa }}</div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border px-2 py-1">
                    <i class="bi bi-people me-1"></i> {{ res.num_personas }}
                  </span>
                </td>
                <td>
                  <!-- Estados dinámicos (Supongamos 1: Pendiente Pago, 2: Confirmada, 3: Completada) -->
                  <span class="badge rounded-pill px-3 py-2" 
                        [ngClass]="{
                          'bg-warning-subtle text-warning border border-warning-subtle': res.id_ct_estado_reservacion === 1,
                          'bg-success-subtle text-success border border-success-subtle': res.id_ct_estado_reservacion === 2,
                          'bg-info-subtle text-info border border-info-subtle': res.id_ct_estado_reservacion === 3,
                          'bg-secondary-subtle text-secondary border border-secondary-subtle': res.id_ct_estado_reservacion === 4,
                          'bg-danger-subtle text-danger border border-danger-subtle': res.id_ct_estado_reservacion === 5,
                          'bg-dark text-white': res.id_ct_estado_reservacion === 6
                        }">
                    {{ getEstadoTexto(res.id_ct_estado_reservacion) }}
                  </span>
                </td>
                <td class="px-4 text-end">
                  <div class="btn-group shadow-sm">
                    <button *ngIf="res.id_ct_estado_reservacion === 2" class="btn btn-sm btn-success d-flex align-items-center gap-1 px-3" (click)="confirmarAsistencia(res)">
                      <i class="bi bi-person-check"></i> Llegó
                    </button>
                    <button *ngIf="res.id_ct_estado_reservacion === 2" class="btn btn-sm btn-outline-warning" (click)="marcarNoShow(res)" title="No se presentó">
                      <i class="bi bi-person-x"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="eliminarReservacion(res)" title="Eliminar/Cancelar definitivamente">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class ReservacionListPage implements OnInit {
  private reservacionService = inject(ReservacionService);
  private notifications = inject(NotificationService);

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
      }
    });
  }

  confirmarAsistencia(res: Reservacion) {
    this.notifications.success(`Cliente de la mesa #${res.id_ct_mesa} marcado como presente.`);
    // TODO: Implementar llamada al API para cambiar estado a "Completada/Presente"
  }

  marcarNoShow(res: Reservacion) {
    this.notifications.confirm('¿Marcar esta reservación como "No se presentó"?', 'Confirmar No-Show', 'Sí, marcar')
      .subscribe(confirmado => {
        if (confirmado) {
          this.notifications.info('Estado actualizado.');
        }
      });
  }

  eliminarReservacion(res: Reservacion) {
    this.notifications.confirm(
      `¿Estás seguro de que deseas cancelar definitivamente la reservación de la mesa #${res.id_ct_mesa}?`,
      'Cancelar Reservación',
      'Sí, cancelar'
    ).subscribe(confirmado => {
      if (confirmado) {
        this.reservacionService.eliminar(res.id_rl_reservacion).subscribe({
          next: () => {
            this.notifications.success('Reservación cancelada correctamente');
            this.cargarReservaciones(); // Recargar lista
          },
          error: () => this.notifications.error('Error al intentar cancelar la reservación')
        });
      }
    });
  }

  getEstadoTexto(id: number): string {
    switch(id) {
      case 1: return 'Pendiente Pago';
      case 2: return 'Confirmada';
      case 3: return 'Completada';
      case 4: return 'No Se Presentó';
      case 5: return 'Cancelada';
      case 6: return 'Cancelada con Cargo';
      default: return 'Desconocido';
    }
  }
}
