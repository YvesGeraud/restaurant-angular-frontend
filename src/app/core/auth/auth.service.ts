import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, AuthCredentials } from './auth.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly options = { withCredentials: true };

  private mapUser(dto: any): User {
    return {
      id: dto.id_ct_usuario,
      usuario: dto.usuario,
      email: dto.email || null,
      nombreCompleto: dto.nombre_completo,
      idRol: dto.id_ct_rol,
      rol: dto.rol,
      permisos: dto.permisos || []
    };
  }

  login(credentials: AuthCredentials): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, this.options).pipe(
      map(res => this.mapUser(res.datos.usuario))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, this.options);
  }

  me(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/me`, this.options).pipe(
      map(res => this.mapUser(res.datos.usuario))
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, this.options);
  }
}
