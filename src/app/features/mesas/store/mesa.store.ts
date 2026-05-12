import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  finalize,
  Subject,
  switchMap,
  EMPTY,
  debounceTime,
  tap,
  distinctUntilChanged,
} from 'rxjs';
import { Mesa, MesaFormData } from '../models/mesa.model';
import { MesasService } from '../services/mesas.service';
import { NotificationService } from '@core/services/notification.service';

/**
 * PARÁMETROS DE FILTRADO
 * Representa los criterios que se envían al backend para filtrar la lista de mesas.
 */
export interface FiltrosMesas {
  busqueda: string;
  status?: string;
  estado?: boolean;
  pagina: number;
  limite: number;
}

/**
 * ESTADO INTERNO DEL STORE
 * Define la estructura de los datos que el Store gestiona de forma reactiva.
 */
interface MesasState {
  mesas: Mesa[]; // Lista actual de mesas cargadas
  loading: boolean; // Indicador de carga activa
  error: string | null; // Mensaje de error si ocurre un fallo
  filtros: FiltrosMesas; // Estado actual de los filtros aplicados
  totalPaginas: number; // Total de páginas devueltas por el API
  totalRegistros: number; // Total de registros que coinciden con el filtro
}

/**
 * STORE DE MESAS (SIGNAL STORE PATTERN)
 * Centraliza el estado de las mesas y gestiona los efectos secundarios (llamadas al API).
 * Utiliza Angular Signals para una reactividad eficiente en la UI.
 */
@Injectable({
  providedIn: 'root'
})
export class MesasStore {
  private readonly mesasService = inject(MesasService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================
  //            GATILLOS REACTIVOS
  // ==========================================

  /** Disparador para carga manual o refresco de datos */
  private readonly loadTrigger$ = new Subject<void>();

  /** Disparador para cambios en los filtros (búsqueda, paginación, etc.) */
  private readonly filterTrigger$ = new Subject<Partial<FiltrosMesas>>();

  // ==========================================
  //            ESTADO PRIVADO (SIGNAL)
  // ==========================================

  private readonly state = signal<MesasState>({
    mesas: [],
    loading: false,
    error: null,
    filtros: {
      busqueda: '',
      pagina: 1,
      limite: 5, // Cantidad de elementos por página
    },
    totalPaginas: 1,
    totalRegistros: 0,
  });

  // ==========================================
  //            SELECTORES PÚBLICOS
  // ==========================================

  readonly mesas = computed(() => this.state().mesas);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly filtros = computed(() => this.state().filtros);
  readonly count = computed(() => this.state().totalRegistros);
  readonly totalPaginas = computed(() => this.state().totalPaginas);
  readonly paginaActual = computed(() => this.state().filtros.pagina);

  constructor() {
    this.initializeEffects();
  }

  /**
   * Inicializa los efectos reactivos para manejar la carga de datos.
   */
  private initializeEffects(): void {
    // 1. Efecto: Carga manual inmediata
    this.loadTrigger$
      .pipe(
        tap(() => this.state.update((s) => ({ ...s, loading: true, error: null }))),
        switchMap(() => this.getMesasObservable()),
        takeUntilDestroyed(),
      )
      .subscribe();

    // 2. Efecto: Búsqueda reactiva con Debounce (evita llamadas excesivas al API)
    this.filterTrigger$
      .pipe(
        debounceTime(400),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        tap((filtrosNuevos) => {
          this.state.update((s) => ({
            ...s,
            loading: true,
            error: null,
            filtros: {
              ...s.filtros,
              ...filtrosNuevos,
              pagina: filtrosNuevos.pagina ?? 1,
            },
          }));
        }),
        switchMap(() => this.getMesasObservable()),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /**
   * Crea el flujo para llamar al servicio y actualizar el estado con la respuesta.
   */
  private getMesasObservable() {
    return this.mesasService.getMesas(this.state().filtros).pipe(
      tap((res) =>
        this.state.update((s) => ({
          ...s,
          mesas: res.datos,
          totalPaginas: res.totalPaginas,
          totalRegistros: res.totalRegistros,
          loading: false,
        })),
      ),
      catchError(() => {
        const msg = 'Error al sincronizar las mesas';
        this.state.update((s) => ({ ...s, error: msg, loading: false }));
        this.notifications.error(msg);
        return EMPTY;
      }),
    );
  }

  // ==========================================
  //            ACCIONES (MÉTODOS)
  // ==========================================

  loadMesas(): void {
    this.loadTrigger$.next();
  }

  applyFilter(filtros: Partial<FiltrosMesas>): void {
    this.filterTrigger$.next(filtros);
  }

  createMesa(data: MesaFormData): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));

    this.mesasService
      .createMesa(data)
      .pipe(
        catchError((err) => {
          this.notifications.error('No se pudo crear la mesa');
          throw err;
        }),
        finalize(() => this.state.update((s) => ({ ...s, loading: false }))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((nuevo) => {
        this.state.update((s) => ({ ...s, mesas: [...s.mesas, nuevo] }));
        this.notifications.success(`"${nuevo.id}" ha sido añadida`);
      });
  }

  createMesasBatch(data: MesaFormData[]): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));
    this.mesasService
      .createMesasBatch(data)
      .pipe(
        catchError((err) => {
          this.notifications.error('Error al procesar la carga masiva');
          throw err;
        }),
        finalize(() => this.state.update((s) => ({ ...s, loading: false }))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        this.notifications.success(
          `Lote procesado: ${resultado.exitosos} de ${resultado.procesados} mesas creadas.`,
          'Carga Masiva Exitosa',
        );
        this.loadMesas();
      });
  }

  updateMesa(id: number, data: MesaFormData): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));

    this.mesasService
      .updateMesa(id, data)
      .pipe(
        catchError((err) => {
          this.notifications.error('Error al guardar los cambios');
          throw err;
        }),
        finalize(() => this.state.update((s) => ({ ...s, loading: false }))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((actualizado) => {
        this.state.update((s) => ({
          ...s,
          mesas: s.mesas.map((p) => (p.id === id ? actualizado : p)),
        }));
        this.notifications.success('Cambios guardados correctamente');
      });
  }

  activateMesa(id: number): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));

    this.mesasService
      .updateMesa(id, { estado: true } as Partial<MesaFormData>)
      .pipe(
        catchError((err) => {
          this.notifications.error('Error al reactivar la mesa');
          throw err;
        }),
        finalize(() => this.state.update((s) => ({ ...s, loading: false }))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((actualizado) => {
        this.state.update((s) => ({
          ...s,
          mesas: s.mesas.map((p) => (p.id === id ? actualizado : p)),
        }));
        this.notifications.success('Mesa reactivada correctamente');
      });
  }

  deleteMesa(id: number): void {
    const original = this.state().mesas;
    const item = original.find((p) => p.id === id);

    if (!item) return;

    this.state.update((s) => ({
      ...s,
      mesas: s.mesas.map((m) => (m.id === id ? { ...m, estado: false } : m)),
    }));

    this.mesasService
      .deleteMesa(id)
      .pipe(
        catchError((err) => {
          this.state.update((s) => ({ ...s, mesas: original }));
          this.notifications.error('Error al intentar desactivar la mesa');
          throw err;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.notifications.success(`Mesa "${item.id}" puesta fuera de servicio`);
      });
  }
}
