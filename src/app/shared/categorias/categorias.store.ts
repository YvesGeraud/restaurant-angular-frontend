import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, switchMap, EMPTY, BehaviorSubject } from 'rxjs';
import { CategoriasService } from './categorias.service';
import { Categoria } from './categoria.model';

interface CategoriasState {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  inicializado: boolean; // para no recargar si ya hay datos
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasStore {
  private readonly apiService = inject(CategoriasService);
  private readonly destroyRef = inject(DestroyRef);

  // 1. Estado reactivo (Signal) Global
  private readonly state = signal<CategoriasState>({
    categorias: [],
    loading: false,
    error: null,
    inicializado: false
  });

  // Gatillo para recargar/cargar la primera vez
  private readonly loadTrigger$ = new BehaviorSubject<void>(undefined);

  // 2. Selectores computados listos para usarse en HTML
  readonly categorias = computed(() => this.state().categorias);
  readonly categoriasActivas = computed(() => this.state().categorias.filter(c => c.estado !== false));
  readonly isLoading = computed(() => this.state().loading);
  readonly hasError = computed(() => this.state().error);
  readonly errorMsg = computed(() => this.state().error);

  constructor() {
    this.loadTrigger$.pipe(
      switchMap(() => {
        // Obtenemos del servidor sÃ³lo las categorias activas para el dropdown
        this.state.update(s => ({ ...s, loading: true, error: null }));
        return this.apiService.getCategorias(true).pipe(
          catchError(err => {
            this.state.update(s => ({ ...s, error: 'Error al cargar las categorÃ­as' }));
            return EMPTY;
          }),
          finalize(() => this.state.update(s => ({ ...s, loading: false })))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((datos: Categoria[]) => {
      this.state.update(s => ({
        ...s,
        categorias: datos,
        inicializado: true
      }));
    });
  }

  // 3. Acciones Puras
  cargarCategorias(forzar: boolean = false): void {
    const s = this.state();
    if (!s.inicializado || forzar) {
      // Disparamos el BehaviorSubject que ejecuta el switchMap => http
      this.loadTrigger$.next();
    }
  }
}

