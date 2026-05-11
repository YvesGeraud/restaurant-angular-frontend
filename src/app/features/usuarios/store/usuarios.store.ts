import { signal, inject, computed, Injectable } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { Usuario, FiltrosUsuarios, Rol, Permiso } from '../models/usuario.model';
import { finalize, lastValueFrom } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosStore {
  private readonly usuarioService = inject(UsuarioService);
  private readonly notifications = inject(NotificationService);

  // Estado
  usuarios = signal<Usuario[]>([]);
  roles = signal<Rol[]>([]);
  permisos = signal<Permiso[]>([]);
  rolPermisos = signal<number[]>([]); // IDs de permisos del rol seleccionado
  loading = signal(false);
  filtros = signal<FiltrosUsuarios>({});

  // Computed
  totalUsuarios = computed(() => this.usuarios().length);

  // Acciones
  async loadUsuarios() {
    this.loading.set(true);
    this.usuarioService
      .getUsuarios(this.filtros())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.usuarios.set(res.datos),
        error: () => this.notifications.error('No se pudieron cargar los usuarios'),
      });
  }

  async loadRoles() {
    this.usuarioService.getRoles().subscribe({
      next: (res) => this.roles.set(res.datos),
      error: () => this.notifications.error('No se pudieron cargar los roles'),
    });
  }

  async loadPermisos() {
    this.usuarioService.getPermisos().subscribe({
      next: (res) => this.permisos.set(res.datos),
      error: () => this.notifications.error('No se pudieron cargar los permisos'),
    });
  }

  async loadPermisosByRol(id_rol: number) {
    this.rolPermisos.set([]);
    try {
      const res = await lastValueFrom(this.usuarioService.getPermisosByRol(id_rol));
      const ids = res.datos.map((p) => p.id_ct_permiso);
      this.rolPermisos.set(ids);
      return ids;
    } catch {
      this.notifications.error('No se pudieron cargar los permisos del rol');
      return [];
    }
  }

  async updateRolPermisos(id_rol: number, permisosIds: number[]) {
    this.loading.set(true);
    this.usuarioService
      .updateRolPermisos(id_rol, permisosIds)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.notifications.success('Permisos actualizados correctamente'),
        error: () => this.notifications.error('Error al actualizar los permisos'),
      });
  }

  setFiltros(filtros: FiltrosUsuarios) {
    this.filtros.set(filtros);
    this.loadUsuarios();
  }

  async eliminarUsuario(id: number) {
    this.notifications
      .confirm('¿Estás seguro de eliminar este usuario?', 'Esta acción no se puede deshacer')
      .subscribe((result) => {
        if (result) {
          this.usuarioService.eliminar(id).subscribe({
            next: () => {
              this.notifications.success('Usuario eliminado correctamente');
              this.loadUsuarios();
            },
            error: () => this.notifications.error('Error al eliminar usuario'),
          });
        }
      });
  }
}
