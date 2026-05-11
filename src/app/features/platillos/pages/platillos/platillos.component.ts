import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Feature dependencies
import { PlatillosStore } from '../../store/platillos.store';
import { PlatilloModalComponent } from '../../components/platillo_modal/platillo_modal.component';

// Shared dependencies (Global Alias)
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { HasPermissionDirective } from '@shared/directives/has_permission.directive';

// Models
import { Platillo, PlatilloFormData } from '../../models/platillo.model';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-platillos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PlatilloModalComponent,
    PaginatorComponent,
    HasPermissionDirective,
  ],
  templateUrl: './platillos.component.html',
  styleUrl: './platillos.component.scss',
})
export class PlatillosComponent implements OnInit {
  protected readonly store = inject(PlatillosStore);
  private readonly notifications = inject(NotificationService);

  isModalOpen = signal(false);
  selectedPlatillo = signal<Platillo | null>(null);

  ngOnInit(): void {
    if (this.store.platillos().length === 0) {
      this.store.loadPlatillos();
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.applyFilter({ busqueda: input.value });
  }

  onPageChange(pagina: number): void {
    this.store.applyFilter({ pagina });
  }

  onNuevoPlatillo(): void {
    this.selectedPlatillo.set(null);
    this.isModalOpen.set(true);
  }

  onEditarPlatillo(platillo: Platillo): void {
    this.selectedPlatillo.set({ ...platillo });
    this.isModalOpen.set(true);
  }

  onEliminarPlatillo(platillo: Platillo): void {
    this.notifications
      .confirm(
        `¿Eliminar "${platillo.nombre}"? Esta acción no se puede deshacer.`,
        'Confirmar Eliminación',
        'Sí, eliminar',
      )
      .subscribe((confirmado) => {
        if (confirmado) {
          this.store.deletePlatillo(platillo.id);
        }
      });
  }

  onReactivarPlatillo(platillo: Platillo): void {
    this.store.activatePlatillo(platillo.id);
  }

  onGuardarPlatillo(data: PlatilloFormData): void {
    const platillo = this.selectedPlatillo();
    if (platillo) {
      this.store.updatePlatillo(platillo.id, data);
    } else {
      this.store.createPlatillo(data);
    }
    this.onCerrarModal();
  }

  onCerrarModal(): void {
    this.isModalOpen.set(false);
    this.selectedPlatillo.set(null);
  }
}
