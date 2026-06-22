import { Injectable, signal, computed, inject } from '@angular/core';
import { Orden, FiltrosOrdenes, EstadoOrden } from '../models/orden.model';
import { OrdenService } from '../services/orden.service';
import { NotificationService } from '@core/services/notification.service';
import { finalize } from 'rxjs';
import { OnOrdenNuevaGQL, OnOrdenActualizadaGQL } from '../../../../graphql/ordenes.generated';
import { AuthStore } from '@core/auth/auth.store';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class OrdenesStore {
  private readonly ordenService = inject(OrdenService);
  private readonly notifications = inject(NotificationService);
  private readonly onOrdenNuevaGQL = inject(OnOrdenNuevaGQL);
  private readonly onOrdenActualizadaGQL = inject(OnOrdenActualizadaGQL);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    this.initGraphQLSubscriptions();
    this.setupAudioUnlocker();
  }

  private setupAudioUnlocker() {
    const unlock = () => {
      console.log('[OrdenesStore] Intentando desbloquear audio por interacción del usuario...');
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.volume = 0; // Muted/silent to not annoy the user
      audio.play()
        .then(() => {
          console.log('[OrdenesStore] Audio context desbloqueado exitosamente para esta pestaña');
          document.removeEventListener('click', unlock);
          document.removeEventListener('keydown', unlock);
        })
        .catch((e) => {
          console.warn('[OrdenesStore] Falló intento de desbloqueo de audio:', e);
        });
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('click', unlock);
      document.addEventListener('keydown', unlock);
    }
  }

  private initGraphQLSubscriptions() {
    console.log('[OrdenesStore] Inicializando suscripciones GraphQL...');

    this.onOrdenNuevaGQL.subscribe().subscribe({
      next: (result) => {
        console.log('[OrdenesStore] Suscripción ordenNueva recibida. Full result:', result);
        const data = result?.data;
        if (data?.ordenNueva) {
          const nueva = data.ordenNueva as unknown as Orden;
          console.log('[OrdenesStore] Nueva orden parseada:', nueva);
          // Agregar la nueva orden al inicio de la lista
          this._ordenes.update((list) => [nueva, ...list]);

          // Notificación visual y auditiva de nueva orden
          const currentUser = this.authStore.user();
          const isSelf = nueva.id_ct_usuario_reg === currentUser?.id;
          const isCocinaView = this.router.url.includes('cocina');

          console.log('[OrdenesStore] Nueva orden debug:', {
            currentUser,
            nueva_id_ct_usuario_reg: nueva.id_ct_usuario_reg,
            isSelf,
            isCocinaView,
            isAuthenticated: this.authStore.isAuthenticated(),
            url: this.router.url
          });

          if (
            this.authStore.isAuthenticated() &&
            this.router.url.startsWith('/admin') &&
            (!isSelf || isCocinaView)
          ) {
            const mesaLabel = nueva.mesa?.codigo || nueva.mesa?.id_ct_mesa || 'N/A';
            console.log('[OrdenesStore] Mostrando notificación e intentando reproducir sonido para ordenNueva');
            this.notifications.info(`Nueva orden #${nueva.id_rl_orden} tomada en Mesa ${mesaLabel}`, 'Nueva Orden');
            this.reproducirSonido();
          } else {
            console.log('[OrdenesStore] No cumple condiciones de notificación para ordenNueva');
          }
        }
      },
      error: (err) => console.error('Error en subscription ordenNueva:', err),
    });

    this.onOrdenActualizadaGQL.subscribe().subscribe({
      next: (result) => {
        console.log('[OrdenesStore] Suscripción ordenActualizada recibida. Full result:', result);
        const data = result?.data;
        if (data?.ordenActualizada) {
          const actualizada = data.ordenActualizada as unknown as Orden;
          console.log('[OrdenesStore] Orden actualizada parseada:', actualizada);
          // Actualizar la orden existente en la lista
          this._ordenes.update((list) =>
            list.map((o) => (o.id_rl_orden === actualizada.id_rl_orden ? actualizada : o)),
          );

          // Notificación visual y auditiva de actualización
          const currentUser = this.authStore.user();
          const isSelfMod = actualizada.id_ct_usuario_mod === currentUser?.id;

          console.log('[OrdenesStore] Orden actualizada debug:', {
            currentUser,
            actualizada_id_ct_usuario_mod: actualizada.id_ct_usuario_mod,
            isSelfMod,
            isAuthenticated: this.authStore.isAuthenticated(),
            url: this.router.url
          });

          if (
            this.authStore.isAuthenticated() &&
            this.router.url.startsWith('/admin') &&
            !isSelfMod
          ) {
            console.log('[OrdenesStore] Mostrando notificación de ordenActualizada');
            this.notifications.success(`Orden #${actualizada.id_rl_orden} actualizada a estado: ${actualizada.estado}`, 'Orden Actualizada');

            // Si la orden está LISTA, sonar el timbre para el mesero
            if (actualizada.estado === 'LISTO') {
              console.log('[OrdenesStore] Estado es LISTO, intentando reproducir sonido');
              this.reproducirSonido();
            }
          } else {
            console.log('[OrdenesStore] No cumple condiciones de notificación para ordenActualizada');
          }
        }
      },
      error: (err) => console.error('Error en subscription ordenActualizada:', err),
    });
  }

  private reproducirSonido() {
    console.log('[OrdenesStore] Intentando reproducir sonido...');
    const audio = new Audio('/assets/sounds/notification.mp3');
    audio.play()
      .then(() => console.log('[OrdenesStore] Sonido reproducido exitosamente'))
      .catch((e) => console.error('[OrdenesStore] Error al reproducir sonido:', e));
  }

  // State
  private readonly _ordenes = signal<Orden[]>([]);
  private readonly _loading = signal(false);
  private readonly _filtros = signal<FiltrosOrdenes>({ pagina: 1, limite: 10 });

  // Selectors
  readonly ordenes = computed(() => this._ordenes());
  readonly loading = computed(() => this._loading());
  readonly activeOrders = computed(() =>
    this._ordenes().filter((o) => o.estado !== 'ENTREGADO' && o.estado !== 'CANCELADO'),
  );

  loadOrdenes() {
    this._loading.set(true);
    this.ordenService
      .getOrdenes(this._filtros())
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (res) => this._ordenes.set(res.datos),
        error: () => this.notifications.error('Error al cargar órdenes'),
      });
  }

  cambiarEstado(id: number, nuevoEstado: EstadoOrden) {
    this.ordenService.actualizarEstado(id, nuevoEstado).subscribe({
      next: (actualizada) => {
        this._ordenes.update((list) => list.map((o) => (o.id_rl_orden === id ? actualizada : o)));
        this.notifications.success(`Orden #${id} ahora está ${nuevoEstado}`);
      },
      error: () => this.notifications.error('No se pudo actualizar el estado'),
    });
  }

  setFiltros(filtros: Partial<FiltrosOrdenes>) {
    this._filtros.update((f) => ({ ...f, ...filtros }));
    this.loadOrdenes();
  }
}
