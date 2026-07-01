import { signal, inject, computed, Injectable } from '@angular/core';
import { finalize } from 'rxjs';
import { ClienteService } from '../services/cliente.service';
import { Cliente, FiltrosClientes } from '../models/cliente.model';
import { NotificationService } from '@core/services/notification.service';

@Injectable({ providedIn: 'root' })
export class ClientesStore {
  private readonly clienteService = inject(ClienteService);
  private readonly notifications = inject(NotificationService);

  clientes = signal<Cliente[]>([]);
  loading = signal(false);
  filtros = signal<FiltrosClientes>({});

  totalClientes = computed(() => this.clientes().length);

  loadClientes() {
    this.loading.set(true);
    this.clienteService
      .getClientes(this.filtros())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.clientes.set(res.datos),
        error: () => this.notifications.error('No se pudieron cargar los clientes'),
      });
  }

  setFiltros(filtros: FiltrosClientes) {
    this.filtros.set(filtros);
    this.loadClientes();
  }

  eliminarCliente(id: number) {
    this.notifications
      .confirm('¿Estás seguro de eliminar este cliente?', 'Esta acción no se puede deshacer')
      .subscribe((result) => {
        if (result) {
          this.clienteService.eliminar(id).subscribe({
            next: () => {
              this.notifications.success('Cliente eliminado correctamente');
              this.loadClientes();
            },
            error: () => this.notifications.error('Error al eliminar el cliente'),
          });
        }
      });
  }
}
