import { Component, inject, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Stores & Services
import { PlatillosStore } from '../../../platillos/store/platillos.store';
import { MesasStore } from '../../../mesas/store/mesa.store';
import { CarritoStore } from '../../store/carrito.store';
import { OrdenService } from '../../services/orden.service';
import { NotificationService } from '@core/services/notification.service';

// Models
import { CrearOrdenFormData } from '../../models/orden.model';
import { Platillo } from '../../../platillos/models/platillo.model';

// Shared Components
import { PlatilloCardComponent } from '@shared/components/platillo-card/platillo-card.component';
import { SearchBoxComponent } from '@shared/components/ui/search-box/search-box.component';

@Component({
  selector: 'app-orden-crear',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PlatilloCardComponent,
    SearchBoxComponent,
  ],
  templateUrl: './orden-crear.html',
  styleUrl: './orden-crear.scss',
})
export class OrdenCrearPage implements OnInit {
  private readonly platillosStore = inject(PlatillosStore);
  private readonly mesasStore = inject(MesasStore);
  private readonly carritoStore = inject(CarritoStore);
  private readonly ordenService = inject(OrdenService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  // Selectores de estado (Signals de los Stores)
  platillos = computed(() => this.platillosStore.platillos());
  mesas = computed(() => this.mesasStore.mesas());
  carrito = computed(() => this.carritoStore.items());
  subtotal = computed(() => this.carritoStore.subtotal());
  total = computed(() => this.carritoStore.total());

  ordenForm = this.fb.group({
    id_mesa: [this.carritoStore.idMesa(), Validators.required],
    num_personas: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    // Sincronizar cambios de la mesa en el formulario con el Store
    effect(() => {
      const idMesa = this.ordenForm.get('id_mesa')?.value;
      this.carritoStore.setMesa(idMesa);
    });
  }

  ngOnInit() {
    this.platillosStore.loadPlatillos();
    this.mesasStore.loadMesas();
    
    // Si ya había una mesa en el store, actualizar el formulario
    if (this.carritoStore.idMesa()) {
      this.ordenForm.patchValue({ id_mesa: this.carritoStore.idMesa() });
    }
  }

  onBuscar(busqueda: string) {
    this.platillosStore.applyFilter({ busqueda });
  }

  agregarAlCarrito(platillo: Platillo) {
    this.carritoStore.agregarPlatillo(platillo);
  }

  quitarDelCarrito(id: number) {
    this.carritoStore.quitarPlatillo(id);
  }

  cambiarCantidad(id: number, delta: number) {
    this.carritoStore.cambiarCantidad(id, delta);
  }

  confirmarOrden() {
    if (this.ordenForm.invalid) return;

    const formValue = this.ordenForm.value;
    const payload: CrearOrdenFormData = {
      detalles: this.carrito().map((i) => ({
        id_ct_platillo: i.id,
        cantidad: i.cantidad,
      })),
    };

    if (formValue.id_mesa !== null && formValue.id_mesa !== undefined) {
      payload.id_mesa = Number(formValue.id_mesa);
    }

    this.ordenService.crear(payload).subscribe({
      next: () => {
        this.notifications.success('Orden creada con éxito');
        this.carritoStore.limpiar(); // ¡Importante vaciar el carrito al terminar!
        this.router.navigate(['/admin/ordenes']);
      },
      error: () => this.notifications.error('Error al crear la orden'),
    });
  }
}
