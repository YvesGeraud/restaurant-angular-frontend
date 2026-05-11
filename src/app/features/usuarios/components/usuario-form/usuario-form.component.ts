import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosStore } from '../../store/usuarios.store';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '@core/services/notification.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="custom-modal-backdrop"
      (click)="formClose.emit()"
      (keydown.escape)="formClose.emit()"
      tabindex="-1"
      role="presentation"
    ></div>
    <div
      class="custom-modal-content p-0 shadow-lg border-0 rounded-4 overflow-hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-header border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
        <h4 class="modal-title fw-bold mb-0">
          {{ usuario ? 'Editar Empleado' : 'Nuevo Empleado' }}
        </h4>
        <button
          type="button"
          class="btn-close shadow-none"
          aria-label="Close"
          (click)="formClose.emit()"
        ></button>
      </div>

      <div class="modal-body p-4 pt-3">
        <form [formGroup]="form" (ngSubmit)="guardar()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label
                for="nombre_completo"
                class="form-label fw-semibold small text-muted text-uppercase tracking-wider"
                >Nombre Completo</label
              >
              <input
                id="nombre_completo"
                type="text"
                class="form-control form-control-lg border-2 shadow-none"
                formControlName="nombre_completo"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label
                for="usuario_login"
                class="form-label fw-semibold small text-muted text-uppercase tracking-wider"
                >Usuario (Login)</label
              >
              <input
                id="usuario_login"
                type="text"
                class="form-control form-control-lg border-2 shadow-none"
                formControlName="usuario"
                placeholder="Ej: jperez"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label
                for="email"
                class="form-label fw-semibold small text-muted text-uppercase tracking-wider"
                >Email</label
              >
              <input
                id="email"
                type="email"
                class="form-control form-control-lg border-2 shadow-none"
                formControlName="email"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label
                for="rol"
                class="form-label fw-semibold small text-muted text-uppercase tracking-wider"
                >Rol en el Restaurante</label
              >
              <select
                id="rol"
                class="form-select form-select-lg border-2 shadow-none"
                formControlName="id_ct_rol"
              >
                <option value="">Selecciona un rol...</option>
                @for (rol of store.roles(); track rol.id_ct_rol) {
                  <option [value]="rol.id_ct_rol">
                    {{ rol.nombre }}
                  </option>
                }
              </select>
            </div>
            @if (!usuario) {
              <div class="col-md-6 mb-3">
                <label
                  for="contrasena"
                  class="form-label fw-semibold small text-muted text-uppercase tracking-wider"
                  >Contraseña</label
                >
                <input
                  id="contrasena"
                  type="password"
                  class="form-control form-control-lg border-2 shadow-none"
                  formControlName="contrasena"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            }
            <div class="col-md-6 mb-3 d-flex align-items-end pb-2">
              <div class="form-check form-switch custom-switch">
                <input
                  id="estadoSwitch"
                  class="form-check-input shadow-none"
                  type="checkbox"
                  formControlName="estado"
                />
                <label class="form-check-label fw-semibold ms-2" for="estadoSwitch"
                  >Usuario Activo</label
                >
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
            <button
              type="button"
              class="btn btn-light btn-lg rounded-pill px-4 fw-semibold"
              (click)="formClose.emit()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm"
              [disabled]="form.invalid || loading"
            >
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              {{ usuario ? 'Actualizar' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .custom-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 1050;
      }
      .custom-modal-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 700px;
        background: white;
        z-index: 1060;
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translate(-50%, -48%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
      .form-control-lg,
      .form-select-lg {
        font-size: 1rem;
      }
      .tracking-wider {
        letter-spacing: 0.05em;
      }
      .custom-switch .form-check-input {
        width: 3em;
        height: 1.5em;
        cursor: pointer;
      }
    `,
  ],
})
export class UsuarioFormComponent implements OnInit {
  @Input() usuario?: Usuario | null;
  @Output() formClose = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly store = inject(UsuariosStore);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notifications = inject(NotificationService);

  form!: FormGroup;
  loading = false;

  ngOnInit() {
    this.form = this.fb.group({
      nombre_completo: [this.usuario?.nombre_completo || '', [Validators.required]],
      usuario: [this.usuario?.usuario || '', [Validators.required]],
      email: [this.usuario?.email || '', [Validators.email]],
      id_ct_rol: [this.usuario?.id_ct_rol || '', [Validators.required]],
      estado: [this.usuario?.estado ?? true],
      contrasena: ['', this.usuario ? [] : [Validators.required, Validators.minLength(6)]],
    });
  }

  guardar() {
    if (this.form.invalid) return;

    this.loading = true;
    const data = this.form.value;

    const request = this.usuario
      ? this.usuarioService.actualizar(this.usuario.id_ct_usuario, data)
      : this.usuarioService.crear(data);

    request.subscribe({
      next: () => {
        this.notifications.success(this.usuario ? 'Personal actualizado' : 'Empleado registrado');
        this.save.emit();
      },
      error: (err: { error?: { mensaje?: string } }) => {
        this.notifications.error(err.error?.mensaje || 'Error al guardar los datos');
        this.loading = false;
      },
    });
  }
}
