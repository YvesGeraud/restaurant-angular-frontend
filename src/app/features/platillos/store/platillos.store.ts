import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, Subject, switchMap, EMPTY, debounceTime, tap, distinctUntilChanged } from 'rxjs';
import { Platillo, PlatilloFormData } from '../models/platillo.model';
import { PlatillosService } from '../services/platillos.service';
import { NotificationService } from '@core/services/notification.service';
import { ResultadoBatch } from '@shared/models/batch_result.model';

/**
 * PARÁMETROS DE FILTRADO
 * Representa los criterios que se envían al backend para filtrar la lista de platillos.
 */
export interface FiltrosPlatillos {
  busqueda: string;
  id_ct_categoria?: number;
  pagina: number;
  limite: number;
}

/**
 * ESTADO INTERNO DEL STORE
 * Define la estructura de los datos que el Store gestiona de forma reactiva.
 */
interface PlatillosState {
  platillos: Platillo[];        // Lista actual de platillos cargados
  loading: boolean;             // Indicador de carga activa
  error: string | null;         // Mensaje de error si ocurre un fallo
  filtros: FiltrosPlatillos;    // Estado actual de los filtros aplicados
  totalPaginas: number;         // Total de páginas devueltas por el API
  totalRegistros: number;       // Total de registros que coinciden con el filtro
}

/**
 * STORE DE PLATILLOS (SIGNAL STORE PATTERN)
 * Centraliza el estado de los platillos y gestiona los efectos secundarios (llamadas al API).
 * Utiliza Angular Signals para una reactividad eficiente en la UI.
 */
@Injectable()
export class PlatillosStore {
  private readonly platillosService = inject(PlatillosService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================
  //            GATILLOS REACTIVOS
  // ==========================================
  
  /** Disparador para carga manual o refresco de datos */
  private readonly loadTrigger$ = new Subject<void>();
  
  /** Disparador para cambios en los filtros (búsqueda, paginación, etc.) */
  private readonly filterTrigger$ = new Subject<Partial<FiltrosPlatillos>>();

  // ==========================================
  //            ESTADO PRIVADO (SIGNAL)
  // ==========================================
  
  private readonly state = signal<PlatillosState>({
    platillos: [],
    loading: false,
    error: null,
    filtros: {
      busqueda: '',
      pagina: 1,
      limite: 5 // Cantidad de elementos por página
    },
    totalPaginas: 1,
    totalRegistros: 0
  });

  // ==========================================
  //            SELECTORES PÚBLICOS
  // ==========================================
  
  readonly platillos = computed(() => this.state().platillos);
  readonly loading   = computed(() => this.state().loading);
  readonly error     = computed(() => this.state().error);
  readonly filtros   = computed(() => this.state().filtros);
  readonly count     = computed(() => this.state().totalRegistros);
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
    this.loadTrigger$.pipe(
      tap(() => this.state.update(s => ({ ...s, loading: true, error: null }))),
      switchMap(() => this.getPlatillosObservable()),
      takeUntilDestroyed()
    ).subscribe();

    // 2. Efecto: Búsqueda reactiva con Debounce (evita llamadas excesivas al API)
    this.filterTrigger$.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      tap((filtrosNuevos) => {
        this.state.update(s => ({ 
          ...s, 
          loading: true, 
          error: null,
          filtros: { 
            ...s.filtros, 
            ...filtrosNuevos,
            // Reseteamos a página 1 si cambió la búsqueda, a menos que se especifique otra
            pagina: filtrosNuevos.pagina ?? 1 
          } 
        }));
      }),
      switchMap(() => this.getPlatillosObservable()),
      takeUntilDestroyed()
    ).subscribe();
  }

  /**
   * Crea el flujo para llamar al servicio y actualizar el estado con la respuesta.
   */
  private getPlatillosObservable() {
    return this.platillosService.getPlatillos(this.state().filtros).pipe(
      tap(res => this.state.update(s => ({ 
        ...s, 
        platillos: res.datos, 
        totalPaginas: res.totalPaginas,
        totalRegistros: res.totalRegistros,
        loading: false 
      }))),
      catchError(err => {
        const msg = 'Error al sincronizar el menú';
        this.state.update(s => ({ ...s, error: msg, loading: false }));
        this.notifications.error(msg);
        return EMPTY;
      })
    );
  }

  // ==========================================
  //            ACCIONES (MÉTODOS)
  // ==========================================

  /**
   * Ejecuta una recarga de los datos actuales.
   */
  loadPlatillos(): void {
    this.loadTrigger$.next();
  }

  /**
   * Actualiza los filtros de búsqueda y dispara la recarga.
   */
  applyFilter(filtros: Partial<FiltrosPlatillos>): void {
    this.filterTrigger$.next(filtros);
  }

  /**
   * Crea un nuevo platillo y lo añade al estado local.
   */
  createPlatillo(data: PlatilloFormData): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    this.platillosService.createPlatillo(data).pipe(
      catchError(err => {
        this.notifications.error('No se pudo crear el platillo');
        throw err;
      }),
      finalize(() => this.state.update(s => ({ ...s, loading: false }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(nuevo => {
      this.state.update(s => ({ ...s, platillos: [...s.platillos, nuevo] }));
      this.notifications.success(`"${nuevo.nombre}" ha sido añadido al menú`);
    });
  }

  /**
   * Procesa una carga masiva de platillos.
   */
  createPlatillosBatch(data: PlatilloFormData[]): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.platillosService.createPlatillosBatch(data).pipe(
      catchError(err => {
        this.notifications.error('Error al procesar la carga masiva');
        throw err;
      }),
      finalize(() => this.state.update(s => ({ ...s, loading: false }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(resultado => {
      this.notifications.success(
        `Lote procesado: ${resultado.exitosos} de ${resultado.procesados} platillos creados.`,
        'Carga Masiva Exitosa'
      );
      this.loadPlatillos();
    });
  }

  /**
   * Actualiza un platillo existente y refresca la lista local.
   */
  updatePlatillo(id: number, data: PlatilloFormData): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    this.platillosService.updatePlatillo(id, data).pipe(
      catchError(err => {
        this.notifications.error('Error al guardar los cambios');
        throw err;
      }),
      finalize(() => this.state.update(s => ({ ...s, loading: false }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(actualizado => {
      this.state.update(s => ({
        ...s,
        platillos: s.platillos.map(p => p.id === id ? actualizado : p),
      }));
      this.notifications.success('Cambios guardados correctamente');
    });
  }

  /**
   * Reactiva un platillo desactivado.
   */
  activatePlatillo(id: number): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    this.platillosService.updatePlatillo(id, { estado: true } as any).pipe(
      catchError(err => {
        this.notifications.error('Error al reactivar el platillo');
        throw err;
      }),
      finalize(() => this.state.update(s => ({ ...s, loading: false }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(actualizado => {
      this.state.update(s => ({
        ...s,
        platillos: s.platillos.map(p => p.id === id ? actualizado : p),
      }));
      this.notifications.success('Platillo reactivado correctamente');
    });
  }

  /**
   * Elimina un platillo aplicando una actualización optimista (se quita de la UI antes de la confirmación del API).
   */
  deletePlatillo(id: number): void {
    const original = this.state().platillos;
    const item = original.find(p => p.id === id);
    
    if (!item) return;

    // Actualización optimista: Cambiamos el estado a inactivo (soft delete)
    this.state.update(s => ({
      ...s,
      platillos: s.platillos.map(p => p.id === id ? { ...p, estado: false } : p),
    }));

    this.platillosService.deletePlatillo(id).pipe(
      catchError(err => {
        // Rollback: Restauramos la lista original
        this.state.update(s => ({ ...s, platillos: original }));
        this.notifications.error('Error al intentar desactivar el platillo');
        throw err;
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.notifications.success(`"${item.nombre}" marcado como agotado`);
    });
  }
}

