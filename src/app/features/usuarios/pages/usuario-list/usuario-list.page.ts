import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosStore } from '../../store/usuarios.store';
import { UsuarioFormComponent } from '../../components/usuario-form/usuario-form.component';
import { Usuario, Rol } from '../../models/usuario.model';
import { HasPermissionDirective } from '@shared/directives/has_permission.directive';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, UsuarioFormComponent, HasPermissionDirective, FormsModule],
  template: `
    <div class="container-fluid py-4 bg-light min-vh-100">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-0">Seguridad y Personal</h2>
          <p class="text-muted">Gestiona el equipo y sus niveles de acceso</p>
        </div>
      </div>

      <!-- Tabs de Navegación -->
      <ul class="nav nav-pills mb-4 bg-white p-2 rounded-pill shadow-sm d-inline-flex">
        <li class="nav-item">
          <button
            type="button"
            class="nav-link rounded-pill px-4"
            [class.active]="activeTab === 'personal'"
            (click)="activeTab = 'personal'"
          >
            <i class="bi bi-people me-2"></i> Lista de Personal
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link rounded-pill px-4"
            [class.active]="activeTab === 'roles'"
            (click)="activeTab = 'roles'"
          >
            <i class="bi bi-shield-lock me-2"></i> Roles y Permisos
          </button>
        </li>
      </ul>

      <!-- CONTENIDO: LISTA DE PERSONAL -->
      @if (activeTab === 'personal') {
        <div class="animate-fade-in">
          <div class="d-flex justify-content-end mb-3">
            <button
              type="button"
              class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold"
              *appHasPermission="'USUARIOS_CREAR'"
              (click)="abrirFormulario()"
            >
              <i class="bi bi-person-plus me-2"></i> Nuevo Empleado
            </button>
          </div>

          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-white">
                  <tr class="text-muted small text-uppercase tracking-wider">
                    <th class="ps-4 border-0">Usuario</th>
                    <th class="border-0">Nombre Completo</th>
                    <th class="border-0">Email</th>
                    <th class="border-0">Rol</th>
                    <th class="border-0">Estado</th>
                    <th class="text-end pe-4 border-0">Acciones</th>
                  </tr>
                </thead>
                <tbody class="border-top-0">
                  @for (user of store.usuarios(); track user.id_ct_usuario) {
                    <tr class="bg-white">
                      <td class="ps-4">
                        <div class="d-flex align-items-center">
                          <div class="avatar-circle bg-primary-subtle text-primary me-3 fw-bold">
                            {{ user.nombre_completo.charAt(0) }}
                          </div>
                          <div>
                            <span class="fw-bold d-block">{{ user.usuario }}</span>
                            <span class="text-muted extra-small">ID: {{ user.id_ct_usuario }}</span>
                          </div>
                        </div>
                      </td>
                      <td class="fw-semibold">{{ user.nombre_completo }}</td>
                      <td class="text-muted">{{ user.email || 'N/A' }}</td>
                      <td>
                        <span
                          class="badge rounded-pill px-3 py-2"
                          [ngClass]="{
                            'bg-danger-subtle text-danger': user.ct_rol.nombre === 'ADMIN',
                            'bg-warning-subtle text-warning': user.ct_rol.nombre === 'COCINA',
                            'bg-info-subtle text-info': user.ct_rol.nombre === 'MESERO',
                            'bg-secondary-subtle text-secondary': user.ct_rol.nombre === 'CAJERO',
                          }"
                        >
                          {{ user.ct_rol.nombre }}
                        </span>
                      </td>
                      <td>
                        <span
                          class="badge rounded-pill px-3 py-2"
                          [ngClass]="
                            user.estado ? 'bg-success-subtle text-success' : 'bg-light text-muted'
                          "
                        >
                          <i class="bi bi-circle-fill me-1 small"></i>
                          {{ user.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        <div class="d-flex justify-content-end gap-1">
                          <button
                            type="button"
                            class="btn btn-icon btn-light-primary"
                            *appHasPermission="'USUARIOS_EDITAR'"
                            (click)="abrirFormulario(user)"
                          >
                            <i class="bi bi-pencil-square"></i>
                          </button>
                          <button
                            type="button"
                            class="btn btn-icon btn-light-danger"
                            *appHasPermission="'USUARIOS_BORRAR'"
                            (click)="store.eliminarUsuario(user.id_ct_usuario)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- CONTENIDO: ROLES Y PERMISOS -->
      @if (activeTab === 'roles') {
        <div class="animate-fade-in">
          <div class="row">
            <!-- Lista de Roles -->
            <div class="col-md-4 col-lg-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <h5 class="fw-bold mb-3 px-2">Selecciona un Rol</h5>
                <div class="list-group list-group-flush gap-2">
                  @for (rol of store.roles(); track rol.id_ct_rol) {
                    <button
                      type="button"
                      class="list-group-item list-group-item-action border-0 rounded-3 px-3 py-2"
                      [class.active]="selectedRol()?.id_ct_rol === rol.id_ct_rol"
                      [class.bg-primary-subtle]="selectedRol()?.id_ct_rol === rol.id_ct_rol"
                      [class.text-primary]="selectedRol()?.id_ct_rol === rol.id_ct_rol"
                      [class.fw-bold]="selectedRol()?.id_ct_rol === rol.id_ct_rol"
                      (click)="seleccionarRol(rol)"
                    >
                      {{ rol.nombre }}
                      <i class="bi bi-chevron-right float-end small mt-1"></i>
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Matriz de Permisos -->
            <div class="col-md-8 col-lg-9">
              @if (selectedRol()) {
                <div class="card border-0 shadow-sm rounded-4 p-4 min-vh-50">
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 class="fw-bold mb-0">Permisos para: {{ selectedRol()?.nombre }}</h4>
                      <p class="text-muted small mb-0">{{ selectedRol()?.descripcion }}</p>
                    </div>
                    <button
                      type="button"
                      class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold"
                      (click)="guardarPermisos()"
                      [disabled]="store.loading()"
                    >
                      <i class="bi bi-save me-2"></i> Guardar Cambios
                    </button>
                  </div>

                  <div class="row g-3">
                    @for (permiso of store.permisos(); track permiso.id_ct_permiso) {
                      <div class="col-md-6 col-xl-4">
                        <button
                          type="button"
                          class="w-100 text-start p-3 rounded-4 border-2 border d-flex align-items-start gap-3 transition-all"
                          [ngClass]="
                            estaMarcado(permiso.id_ct_permiso)
                              ? 'border-primary bg-primary-subtle'
                              : 'border-light bg-light'
                          "
                          (click)="togglePermiso(permiso.id_ct_permiso)"
                        >
                          <div class="form-check m-0">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              [checked]="estaMarcado(permiso.id_ct_permiso)"
                              (change)="
                                $event.stopPropagation(); togglePermiso(permiso.id_ct_permiso)
                              "
                            />
                          </div>
                          <div>
                            <span class="d-block fw-bold small text-uppercase">{{
                              permiso.nombre
                            }}</span>
                            <span class="text-muted extra-small">{{ permiso.descripcion }}</span>
                          </div>
                        </button>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <!-- Empty State -->
                <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
                  <i class="bi bi-shield-lock display-1 text-light-gray mb-3"></i>
                  <h4 class="text-muted fw-bold">Gestión de Accesos</h4>
                  <p class="text-muted">
                    Selecciona un rol a la izquierda para administrar sus permisos.
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal de Formulario -->
      @if (isModalOpen()) {
        <app-usuario-form
          [usuario]="selectedUsuario()"
          (formClose)="cerrarFormulario()"
          (save)="onUsuarioGuardado()"
        >
        </app-usuario-form>
      }
    </div>
  `,
  styles: [
    `
      .nav-pills .nav-link {
        color: #6c757d;
        font-weight: 600;
      }
      .nav-pills .nav-link.active {
        background-color: #0d6efd;
        color: white;
      }
      .avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .extra-small {
        font-size: 0.75rem;
      }
      .btn-icon {
        width: 35px;
        height: 35px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: #f8f9fa;
        transition: all 0.2s;
      }
      .btn-light-primary:hover {
        background: #cfe2ff;
        color: #0d6efd;
      }
      .btn-light-danger:hover {
        background: #f8d7da;
        color: #dc3545;
      }
      .transition-all {
        transition: all 0.2s ease;
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .text-light-gray {
        color: #dee2e6;
      }
    `,
  ],
})
export class UsuarioListPage implements OnInit {
  readonly store = inject(UsuariosStore);

  activeTab: 'personal' | 'roles' = 'personal';
  isModalOpen = signal(false);
  selectedUsuario = signal<Usuario | null>(null);
  selectedRol = signal<Rol | null>(null);

  // Lista local de IDs marcados para no mutar el store directamente hasta guardar
  permisosSeleccionados = signal<number[]>([]);

  ngOnInit() {
    this.store.loadUsuarios();
    this.store.loadRoles();
    this.store.loadPermisos();
  }

  abrirFormulario(usuario: Usuario | null = null) {
    this.selectedUsuario.set(usuario);
    this.isModalOpen.set(true);
  }

  cerrarFormulario() {
    this.isModalOpen.set(false);
    this.selectedUsuario.set(null);
  }

  onUsuarioGuardado() {
    this.cerrarFormulario();
    this.store.loadUsuarios();
  }

  async seleccionarRol(rol: Rol) {
    this.selectedRol.set(rol);
    const ids = await this.store.loadPermisosByRol(rol.id_ct_rol);
    this.permisosSeleccionados.set([...ids]);
  }

  estaMarcado(id: number): boolean {
    return this.permisosSeleccionados().includes(id);
  }

  togglePermiso(id: number) {
    const actuales = this.permisosSeleccionados();
    if (actuales.includes(id)) {
      this.permisosSeleccionados.set(actuales.filter((p) => p !== id));
    } else {
      this.permisosSeleccionados.set([...actuales, id]);
    }
  }

  guardarPermisos() {
    const rol = this.selectedRol();
    if (rol) {
      this.store.updateRolPermisos(rol.id_ct_rol, this.permisosSeleccionados());
    }
  }
}
