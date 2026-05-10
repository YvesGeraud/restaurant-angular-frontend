import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdenService } from '../../services/orden.service';
import { PlatillosStore } from '../../../platillos/store/platillos.store';
import { PlatillosService } from '../../../platillos/services/platillos.service';
import { MesasStore } from '../../../mesas/store/mesa.store';
import { MesasService } from '../../../mesas/services/mesas.service';
import { NotificationService } from '@core/services/notification.service';
import { Platillo } from '../../../platillos/models/platillo.model';

@Component({
  selector: 'app-orden-crear',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [PlatillosStore, PlatillosService, MesasStore, MesasService],
  template: `
    <div class="container-fluid py-4 h-100 d-flex flex-column" style="max-height: 90vh;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold mb-0">{{ editMode ? 'Editar Orden #' + orderId : 'Nueva Orden' }}</h2>
        <button class="btn btn-outline-secondary btn-sm" (click)="regresar()">
          <i class="bi bi-x-lg"></i> Cancelar
        </button>
      </div>

      <div class="row g-4 flex-grow-1 overflow-hidden">
        <!-- Panel Izquierdo: Selección de Platillos -->
        <div class="col-lg-8 d-flex flex-column overflow-hidden">
          <div class="card border-0 shadow-sm rounded-4 flex-grow-1 d-flex flex-column overflow-hidden">
            <div class="card-header bg-white border-0 p-3">
              <div class="input-group">
                <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control bg-light border-0" 
                       placeholder="Buscar platillo..." 
                       [(ngModel)]="busqueda" (input)="filtrarPlatillos()">
              </div>
            </div>
            
            <div class="card-body overflow-auto p-3 pt-0">
              <div class="row g-3">
                <div class="col-md-4 col-xl-3" *ngFor="let p of platillosFiltrados()">
                  <div class="card h-100 border-0 shadow-sm rounded-3 cursor-pointer platillo-item" (click)="agregarPlatillo(p)">
                    <img [src]="p.imagenUrl || 'assets/placeholder-food.png'" class="card-img-top object-fit-cover" style="height: 120px;" [alt]="p.nombre">
                    <div class="card-body p-2 text-center">
                      <div class="small fw-bold text-truncate">{{ p.nombre }}</div>
                      <div class="text-primary fw-bold">{{ p.precio | currency }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Derecho: Resumen y Mesa -->
        <div class="col-lg-4 d-flex flex-column overflow-hidden">
          <div class="card border-0 shadow-sm rounded-4 flex-grow-1 d-flex flex-column overflow-hidden">
            <div class="card-body d-flex flex-column p-4">
              <div class="mb-4">
                <label class="form-label fw-bold text-muted small">SELECCIONAR MESA</label>
                <select class="form-select border-0 bg-light py-3" [(ngModel)]="idMesa">
                  <option [ngValue]="null">Para llevar / Sin mesa</option>
                  <option *ngFor="let m of mesasStore.mesas()" [ngValue]="m.id">Mesa {{ m.codigo || m.id }} ({{ m.capacidad }} pers)</option>
                </select>
              </div>

              <div class="flex-grow-1 overflow-auto mb-4">
                <label class="form-label fw-bold text-muted small mb-3">RESUMEN DE ORDEN</label>
                <div *ngFor="let item of carrito()" class="d-flex align-items-center gap-3 mb-3 animate__animated animate__fadeInRight">
                  <div class="fw-bold bg-primary bg-opacity-10 text-primary px-2 py-1 rounded">{{ item.cantidad }}x</div>
                  <div class="flex-grow-1">
                    <div class="fw-bold small text-truncate">{{ item.platillo.nombre }}</div>
                    <div class="text-muted smaller">{{ item.platillo.precio | currency }} c/u</div>
                  </div>
                  <div class="fw-bold">{{ (item.platillo.precio * item.cantidad) | currency }}</div>
                  <button class="btn btn-sm text-danger" (click)="quitarPlatillo(item.platillo.id)">
                    <i class="bi bi-dash-circle"></i>
                  </button>
                </div>

                <div *ngIf="carrito().length === 0" class="text-center py-5 text-muted opacity-50">
                   <i class="bi bi-cart3 display-1"></i>
                   <p class="mt-2">Agrega platillos para comenzar</p>
                </div>
              </div>

              <div class="border-top pt-4">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal</span>
                  <span>{{ total() | currency }}</span>
                </div>
                <div class="d-flex justify-content-between mb-4">
                  <span class="h4 fw-bold">Total</span>
                  <span class="h4 fw-bold text-primary">{{ total() | currency }}</span>
                </div>
                <button class="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow" 
                        [disabled]="carrito().length === 0 || cargando"
                        (click)="enviarOrden()">
                  <span *ngIf="!cargando">{{ editMode ? 'ACTUALIZAR ORDEN' : 'ENVIAR A COCINA' }}</span>
                  <span *ngIf="cargando" class="spinner-border spinner-border-sm"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .platillo-item { transition: all 0.2s; border: 2px solid transparent !important; }
    .platillo-item:hover { transform: scale(1.05); border-color: var(--bs-primary) !important; }
    .smaller { font-size: 0.75rem; }
    .cursor-pointer { cursor: pointer; }
  `]
})
export class OrdenCrearPage implements OnInit {
  private readonly ordenService = inject(OrdenService);
  protected readonly platillosStore = inject(PlatillosStore);
  protected readonly mesasStore = inject(MesasStore);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  idMesa: number | null = null;
  busqueda = '';
  carrito = signal<{ platillo: Platillo, cantidad: number }[]>([]);
  cargando = false;
  editMode = false;
  orderId: number | null = null;

  total = computed(() => 
    this.carrito().reduce((acc, item) => acc + (Number(item.platillo.precio) * item.cantidad), 0)
  );

  platillosFiltrados = computed(() => {
    const term = this.busqueda.toLowerCase();
    return this.platillosStore.platillos().filter(p => 
      p.nombre.toLowerCase().includes(term) || p.descripcion?.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.platillosStore.loadPlatillos();
    this.mesasStore.loadMesas();

    // Verificar si es edición
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.editMode = true;
      this.orderId = Number(id);
      this.cargarOrden(this.orderId);
    }
  }

  cargarOrden(id: number) {
    this.cargando = true;
    this.ordenService.getOrdenById(id).subscribe({
      next: (orden) => {
        this.idMesa = orden.id_ct_mesa || null;
        
        // Mapear los detalles al carrito
        const items = orden.detalles.map(d => ({
          platillo: {
            id: d.id_ct_platillo,
            nombre: d.platillo?.nombre || 'Desconocido',
            precio: Number(d.precio_unitario),
            imagenUrl: d.platillo?.imagen_url || '',
            descripcion: '',
            estado: true,
            categoria: { id: 0, nombre: '' }
          } as Platillo,
          cantidad: d.cantidad
        }));
        
        this.carrito.set(items);
        this.cargando = false;
      },
      error: () => {
        this.notifications.error('No se pudo cargar la orden para editar');
        this.router.navigate(['/admin/ordenes']);
      }
    });
  }

  filtrarPlatillos() {
    // La reactividad se maneja por el computed platillosFiltrados
  }

  agregarPlatillo(platillo: Platillo) {
    this.carrito.update(items => {
      const existing = items.find(i => i.platillo.id === platillo.id);
      if (existing) {
        return items.map(i => i.platillo.id === platillo.id 
          ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...items, { platillo, cantidad: 1 }];
    });
  }

  quitarPlatillo(id: number) {
    this.carrito.update(items => {
      const existing = items.find(i => i.platillo.id === id);
      if (existing && existing.cantidad > 1) {
        return items.map(i => i.platillo.id === id 
          ? { ...i, cantidad: i.cantidad - 1 } : i);
      }
      return items.filter(i => i.platillo.id !== id);
    });
  }

  enviarOrden() {
    this.cargando = true;
    const data = {
      id_mesa: this.idMesa || undefined,
      detalles: this.carrito().map(i => ({
        id_ct_platillo: i.platillo.id!,
        cantidad: i.cantidad
      }))
    };

    const obs = this.editMode && this.orderId 
      ? this.ordenService.actualizar(this.orderId, data)
      : this.ordenService.crear(data);

    obs.subscribe({
      next: () => {
        this.notifications.success(this.editMode ? '¡Orden actualizada!' : '¡Orden enviada a cocina con éxito!');
        this.router.navigate(['/admin/ordenes']);
      },
      error: () => {
        this.notifications.error('Error al procesar la orden');
        this.cargando = false;
      }
    });
  }

  regresar() {
    this.router.navigate(['/admin/ordenes']);
  }
}
