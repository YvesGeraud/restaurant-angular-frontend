import { Injectable, signal, computed, inject } from '@angular/core';
import { Orden, FiltrosOrdenes, EstadoOrden } from '../models/orden.model';
import { OrdenService } from '../services/orden.service';
import { NotificationService } from '@core/services/notification.service';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdenesStore {
  private readonly ordenService = inject(OrdenService);
  private readonly notifications = inject(NotificationService);

  // State
  private readonly _ordenes = signal<Orden[]>([]);
  private readonly _loading = signal(false);
  private readonly _filtros = signal<FiltrosOrdenes>({ pagina: 1, limite: 10 });

  // Selectors
  readonly ordenes = computed(() => this._ordenes());
  readonly loading = computed(() => this._loading());
  readonly activeOrders = computed(() => 
    this._ordenes().filter(o => o.estado !== 'ENTREGADO' && o.estado !== 'CANCELADO')
  );

  loadOrdenes() {
    this._loading.set(true);
    this.ordenService.getOrdenes(this._filtros()).pipe(
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: (res) => this._ordenes.set(res.datos),
      error: () => this.notifications.error('Error al cargar órdenes')
    });
  }

  cambiarEstado(id: number, nuevoEstado: EstadoOrden) {
    this.ordenService.actualizarEstado(id, nuevoEstado).subscribe({
      next: (actualizada) => {
        this._ordenes.update(list => list.map(o => o.id_rl_orden === id ? actualizada : o));
        this.notifications.success(`Orden #${id} ahora está ${nuevoEstado}`);
      },
      error: () => this.notifications.error('No se pudo actualizar el estado')
    });
  }

  setFiltros(filtros: Partial<FiltrosOrdenes>) {
    this._filtros.update(f => ({ ...f, ...filtros }));
    this.loadOrdenes();
  }
}
