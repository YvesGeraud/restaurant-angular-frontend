import { Component, inject, input, output, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { ClientesStore } from '../../store/clientes.store';
import { Cliente, ClienteFormData } from '../../models/cliente.model';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <!-- Header -->
          <div class="modal-header border-0 bg-primary text-white px-4 py-3">
            <h5 class="modal-title fw-bold mb-0">
              <i class="bi bi-person me-2"></i>
              {{ clienteEditar() ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="cerrar.emit()"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4">
            <form #form="ngForm" (ngSubmit)="guardar(form.valid)">
              <!-- Nombre -->
              <div class="mb-3">
                <label class="form-label fw-semibold small text-muted text-uppercase">Nombre</label>
                <input
                  type="text"
                  class="form-control rounded-3"
                  name="nombre"
                  [(ngModel)]="datos.nombre"
                  required
                  minlength="1"
                  maxlength="100"
                  placeholder="Nombre completo"
                  #nombreCtrl="ngModel"
                  [class.is-invalid]="nombreCtrl.invalid && nombreCtrl.touched"
                />
                <div class="invalid-feedback">El nombre es obligatorio</div>
              </div>

              <!-- Correo -->
              <div class="mb-3">
                <label class="form-label fw-semibold small text-muted text-uppercase">Correo electrónico</label>
                <input
                  type="email"
                  class="form-control rounded-3"
                  name="correo"
                  [(ngModel)]="datos.correo"
                  required
                  email
                  maxlength="255"
                  placeholder="correo@ejemplo.com"
                  #correoCtrl="ngModel"
                  [class.is-invalid]="correoCtrl.invalid && correoCtrl.touched"
                />
                <div class="invalid-feedback">Ingresa un correo electrónico válido</div>
              </div>

              <!-- Teléfono -->
              <div class="mb-3">
                <label class="form-label fw-semibold small text-muted text-uppercase">Teléfono</label>
                <input
                  type="tel"
                  class="form-control rounded-3"
                  name="telefono"
                  [(ngModel)]="datos.telefono"
                  required
                  placeholder="+52 555 000 0000"
                  #telefonoCtrl="ngModel"
                  [class.is-invalid]="telefonoCtrl.invalid && telefonoCtrl.touched"
                />
                <div class="invalid-feedback">El teléfono es obligatorio</div>
              </div>

              <!-- Estado (solo en edición) -->
              @if (clienteEditar()) {
                <div class="mb-3">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="estado"
                      name="estado"
                      [(ngModel)]="datos.estado"
                    />
                    <label class="form-check-label fw-semibold" for="estado">
                      {{ datos.estado ? 'Activo' : 'Inactivo' }}
                    </label>
                  </div>
                </div>
              }

              <!-- Footer con botones -->
              <div class="d-flex gap-2 justify-content-end mt-4">
                <button type="button" class="btn btn-light rounded-pill px-4" (click)="cerrar.emit()">
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-primary rounded-pill px-4 fw-bold"
                  [disabled]="guardando()"
                >
                  @if (guardando()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  {{ clienteEditar() ? 'Guardar cambios' : 'Crear cliente' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ClienteFormComponent implements OnChanges {
  private readonly clienteService = inject(ClienteService);
  private readonly clientesStore = inject(ClientesStore);
  private readonly notifications = inject(NotificationService);

  clienteEditar = input<Cliente | null>(null);
  cerrar = output<void>();
  guardado = output<void>();

  guardando = signal(false);

  datos: ClienteFormData & { estado?: boolean } = {
    nombre: '',
    correo: '',
    telefono: '',
    estado: true,
  };

  ngOnChanges() {
    const c = this.clienteEditar();
    if (c) {
      this.datos = { nombre: c.nombre, correo: c.correo, telefono: c.telefono, estado: c.estado };
    } else {
      this.datos = { nombre: '', correo: '', telefono: '', estado: true };
    }
  }

  guardar(valid: boolean | null) {
    if (!valid) return;
    this.guardando.set(true);

    const editar = this.clienteEditar();
    const obs = editar
      ? this.clienteService.actualizar(editar.id_ct_cliente, this.datos)
      : this.clienteService.crear(this.datos);

    obs.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.notifications.success(editar ? 'Cliente actualizado' : 'Cliente creado correctamente');
        this.clientesStore.loadClientes();
        this.guardado.emit();
      },
      error: () =>
        this.notifications.error(editar ? 'Error al actualizar el cliente' : 'Error al crear el cliente'),
    });
  }
}
