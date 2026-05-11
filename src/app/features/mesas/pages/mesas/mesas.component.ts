import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Feature dependencies
import { MesasStore } from '../../store/mesa.store';
import { MesaModalComponent } from '../../components/mesa_modal/mesa_modal.component';

// Shared dependencies
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { HasPermissionDirective } from '@shared/directives/has_permission.directive';
import { NotificationService } from '@core/services/notification.service';

// Models
import { Mesa, MesaFormData } from '../../models/mesa.model';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MesaModalComponent,
    PaginatorComponent,
    HasPermissionDirective,
  ],
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss',
})
export class MesasComponent implements OnInit {
  protected readonly store = inject(MesasStore);
  private readonly notifications = inject(NotificationService);

  isModalOpen = signal(false);
  selectedMesa = signal<Mesa | null>(null);

  ngOnInit(): void {
    if (this.store.mesas().length === 0) {
      this.store.loadMesas();
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.applyFilter({ busqueda: input.value });
  }

  onPageChange(pagina: number): void {
    this.store.applyFilter({ pagina });
  }

  onNuevaMesa(): void {
    this.selectedMesa.set(null);
    this.isModalOpen.set(true);
  }

  onEditarMesa(mesa: Mesa): void {
    this.selectedMesa.set({ ...mesa });
    this.isModalOpen.set(true);
  }

  onEliminarMesa(mesa: Mesa): void {
    this.notifications
      .confirm(
        `¿Eliminar "${mesa.codigo}"? Esta acción no se puede deshacer.`,
        'Confirmar Eliminación',
        'Sí, eliminar',
      )
      .subscribe((confirmado) => {
        if (confirmado && mesa.id) {
          this.store.deleteMesa(mesa.id);
        }
      });
  }

  onReactivarMesa(mesa: Mesa): void {
    if (mesa.id) {
      this.store.activateMesa(mesa.id);
    }
  }

  onGuardarMesa(data: MesaFormData): void {
    const mesa = this.selectedMesa();
    if (mesa && mesa.id) {
      this.store.updateMesa(mesa.id, data);
    } else {
      this.store.createMesa(data);
    }
    this.onCerrarModal();
  }

  onCerrarModal(): void {
    this.isModalOpen.set(false);
    this.selectedMesa.set(null);
  }
}
