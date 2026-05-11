import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Usuario, UsuarioFormData, FiltrosUsuarios, Rol, Permiso } from '../models/usuario.model';
import { PaginatedResponse } from '@shared/models/pagination.model';

export interface ApiResponse<T> {
  exito: boolean;
  datos: T;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  getUsuarios(filtros: FiltrosUsuarios = {}): Observable<PaginatedResponse<Usuario>> {
    const params = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return this.http.get<PaginatedResponse<Usuario>>(this.apiUrl, { params });
  }

  getRoles(): Observable<ApiResponse<Rol[]>> {
    return this.http.get<ApiResponse<Rol[]>>(`${this.apiUrl}/roles`);
  }

  getPermisos(): Observable<ApiResponse<Permiso[]>> {
    return this.http.get<ApiResponse<Permiso[]>>(`${this.apiUrl}/permisos`);
  }

  getPermisosByRol(id_rol: number): Observable<ApiResponse<{ id_ct_permiso: number }[]>> {
    return this.http.get<ApiResponse<{ id_ct_permiso: number }[]>>(
      `${this.apiUrl}/roles/${id_rol}/permisos`,
    );
  }

  updateRolPermisos(id_rol: number, permisosIds: number[]): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/roles/${id_rol}/permisos`, {
      permisosIds,
    });
  }

  crear(data: UsuarioFormData): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, data);
  }

  actualizar(id: number, data: Partial<UsuarioFormData>): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
