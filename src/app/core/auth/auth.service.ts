import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, AuthCredentials } from './auth.model';
import { environment } from '@environments/environment';

interface UserDTO {
  id_ct_usuario: number;
  usuario: string;
  email?: string | null;
  nombre_completo: string;
  id_ct_rol: number;
  rol: string;
  permisos: string[];
}

interface AuthResponse {
  datos: {
    usuario: UserDTO;
    token?: string;
  };
  mensaje?: string;
  exito: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly options = { withCredentials: true };

  private mapUser(dto: UserDTO): User {
    return {
      id: dto.id_ct_usuario,
      usuario: dto.usuario,
      email: dto.email || null,
      nombreCompleto: dto.nombre_completo,
      idRol: dto.id_ct_rol,
      rol: dto.rol,
      permisos: dto.permisos || [],
    };
  }

  login(credentials: AuthCredentials): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials, this.options)
      .pipe(map((res) => this.mapUser(res.datos.usuario)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, this.options);
  }

  me(): Observable<User> {
    return this.http
      .get<AuthResponse>(`${this.apiUrl}/me`, this.options)
      .pipe(map((res) => this.mapUser(res.datos.usuario)));
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, this.options);
  }

  solicitarRecuperacion(email: string): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.post<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetearContrasena(token: string, contrasena_nueva: string, confirmar_contrasena: string): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.post<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/reset-password`, {
      token,
      contrasena_nueva,
      confirmar_contrasena,
    });
  }

  cambiarContrasena(contrasena_actual: string, contrasena_nueva: string, confirmar_contrasena: string): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.post<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/change-password`, {
      contrasena_actual,
      contrasena_nueva,
      confirmar_contrasena,
    }, this.options);
  }
}
