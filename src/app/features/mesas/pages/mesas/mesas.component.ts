import { Component, OnInit, inject } from '@angular/core';
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
    HasPermissionDirective
  ],
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss',
})
export class MesasComponent implements OnInit {
  protected readonly store = inject(MesasStore);
  private readonly notifications = inject(NotificationService);

  isModalOpen = false;
  selectedMesa: Mesa | null = null;

  ngOnInit(): void {
    if (this.store.mesas().length === 0) {
      this.store.loadMesas();
    }
  }

  onSearch(termino: string): void {
    this.store.applyFilter({ busqueda: termino });
  }

  onPageChange(pagina: number): void {
    this.store.applyFilter({ pagina });
  }

  onNuevaMesa(): void {
    this.selectedMesa = null;
    this.isModalOpen = true;
  }

  onEditarMesa(mesa: Mesa): void {
    this.selectedMesa = { ...mesa };
    this.isModalOpen = true;
  }

  onEliminarMesa(mesa: Mesa): void {
    this.notifications.confirm(
      `¿Eliminar "${mesa.codigo}"? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación',
      'Sí, eliminar'
    ).subscribe(confirmado => {
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
    if (this.selectedMesa && this.selectedMesa.id) {
      this.store.updateMesa(this.selectedMesa.id, data);
    } else {
      this.store.createMesa(data);
    }
    this.onCerrarModal();
  }

  onCerrarModal(): void {
    this.isModalOpen = false;
    this.selectedMesa = null;
  }
}
