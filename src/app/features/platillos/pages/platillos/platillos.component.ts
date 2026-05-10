import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Feature dependencies
import { PlatillosStore } from '../../store/platillos.store';
import { PlatilloCardComponent } from '../../components/platillo_card/platillo_card.component';
import { PlatilloModalComponent } from '../../components/platillo_modal/platillo_modal.component';
import { PlatilloSkeletonComponent } from '../../components/platillo_skeleton/platillo_skeleton.component';

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
    PlatilloCardComponent,
    PlatilloModalComponent,
    PlatilloSkeletonComponent,
    PaginatorComponent,
    HasPermissionDirective
  ],
  templateUrl: './platillos.component.html',
  styleUrl: './platillos.component.scss',
})
export class PlatillosComponent implements OnInit {
  protected readonly store = inject(PlatillosStore);
  private readonly notifications = inject(NotificationService);

  isModalOpen = false;
  selectedPlatillo: Platillo | null = null;

  ngOnInit(): void {
    if (this.store.platillos().length === 0) {
      this.store.loadPlatillos();
    }
  }

  onSearch(termino: string): void {
    this.store.applyFilter({ busqueda: termino });
  }

  onPageChange(pagina: number): void {
    this.store.applyFilter({ pagina });
  }

  onNuevoPlatillo(): void {
    this.selectedPlatillo = null;
    this.isModalOpen = true;
  }

  onEditarPlatillo(platillo: Platillo): void {
    this.selectedPlatillo = { ...platillo };
    this.isModalOpen = true;
  }

  onEliminarPlatillo(platillo: Platillo): void {
    this.notifications.confirm(
      `¿Eliminar "${platillo.nombre}"? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación',
      'Sí, eliminar'
    ).subscribe(confirmado => {
      if (confirmado) {
        this.store.deletePlatillo(platillo.id);
      }
    });
  }

  onReactivarPlatillo(platillo: Platillo): void {
    this.store.activatePlatillo(platillo.id);
  }

  onGuardarPlatillo(data: PlatilloFormData): void {
    if (this.selectedPlatillo) {
      this.store.updatePlatillo(this.selectedPlatillo.id, data);
    } else {
      this.store.createPlatillo(data);
    }
    this.onCerrarModal();
  }

  onCerrarModal(): void {
    this.isModalOpen = false;
    this.selectedPlatillo = null;
  }
}
