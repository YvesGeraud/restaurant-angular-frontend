import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesStore } from '../../store/clientes.store';
import { ClienteFormComponent } from '../../components/cliente-form/cliente-form.component';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ClienteFormComponent],
  template: `
    <div class="container-fluid py-4 animate-fade-in">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1 fw-bold text-dark">Clientes</h2>
          <p class="text-muted mb-0">
            {{ store.totalClientes() }} cliente{{ store.totalClientes() !== 1 ? 's' : '' }} registrado{{ store.totalClientes() !== 1 ? 's' : '' }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
          (click)="abrirFormulario(null)"
        >
          <i class="bi bi-plus-lg me-2"></i>Nuevo cliente
        </button>
      </div>

      <!-- Filtros -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-3">
          <div class="row g-2 align-items-center">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="Buscar por nombre, correo o teléfono..."
                  [(ngModel)]="busqueda"
                  (input)="filtrar()"
                />
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="estadoFiltro" (change)="filtrar()">
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
            <div class="col-md-3 text-end">
              <button
                type="button"
                class="btn btn-outline-secondary rounded-pill px-3"
                (click)="limpiarFiltros()"
              >
                <i class="bi bi-x-circle me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="text-muted small fw-bold text-uppercase tracking-wider">
                <th class="py-3 px-4">#</th>
                <th class="py-3">Nombre</th>
                <th class="py-3">Correo</th>
                <th class="py-3">Teléfono</th>
                <th class="py-3">Estado</th>
                <th class="py-3">Registro</th>
                <th class="py-3 px-4 text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (store.loading()) {
                <tr>
                  <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <p class="text-muted mb-0">Cargando clientes...</p>
                  </td>
                </tr>
              } @else {
                @for (cliente of store.clientes(); track cliente.id_ct_cliente) {
                  <tr>
                    <td class="px-4 text-muted small">{{ cliente.id_ct_cliente }}</td>
                    <td>
                      <div class="fw-semibold text-dark">{{ cliente.nombre }}</div>
                    </td>
                    <td>
                      <span class="text-muted">{{ cliente.correo }}</span>
                    </td>
                    <td>{{ cliente.telefono }}</td>
                    <td>
                      <span
                        class="badge rounded-pill px-3 py-2"
                        [class]="cliente.estado
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : 'bg-secondary-subtle text-secondary border border-secondary-subtle'"
                      >
                        <i class="bi me-1" [class]="cliente.estado ? 'bi-check-circle' : 'bi-slash-circle'"></i>
                        {{ cliente.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ cliente.fecha_reg | date: 'dd/MM/yyyy' }}</td>
                    <td class="px-4 text-end">
                      <div class="btn-group shadow-sm rounded-3 overflow-hidden border">
                        <button
                          type="button"
                          class="btn btn-sm btn-white border-0 py-2 px-3 text-primary"
                          (click)="abrirFormulario(cliente)"
                          title="Editar"
                        >
                          <i class="bi bi-pencil fs-6"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-white border-0 py-2 px-3 text-danger"
                          (click)="store.eliminarCliente(cliente.id_ct_cliente)"
                          title="Eliminar"
                        >
                          <i class="bi bi-trash fs-6"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                      <i class="bi bi-people display-4 d-block mb-3 opacity-25"></i>
                      <h5 class="fw-bold">Sin clientes</h5>
                      <p class="mb-0">No hay clientes registrados con los filtros actuales.</p>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal formulario -->
    @if (mostrarFormulario()) {
      <app-cliente-form
        [clienteEditar]="clienteSeleccionado()"
        (cerrar)="cerrarFormulario()"
        (guardado)="cerrarFormulario()"
      />
    }
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .tracking-wider { letter-spacing: 0.05em; }
    .btn-white { background: white; }
    .btn-white:hover { background: #f8f9fa; }
  `],
})
export class ClienteListPage implements OnInit {
  readonly store = inject(ClientesStore);

  mostrarFormulario = signal(false);
  clienteSeleccionado = signal<Cliente | null>(null);
  busqueda = '';
  estadoFiltro = '';

  ngOnInit() {
    this.store.loadClientes();
  }

  abrirFormulario(cliente: Cliente | null) {
    this.clienteSeleccionado.set(cliente);
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.clienteSeleccionado.set(null);
  }

  filtrar() {
    this.store.setFiltros({
      busqueda: this.busqueda || undefined,
      estado: this.estadoFiltro !== '' ? this.estadoFiltro === 'true' : undefined,
    });
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.estadoFiltro = '';
    this.store.setFiltros({});
  }
}
