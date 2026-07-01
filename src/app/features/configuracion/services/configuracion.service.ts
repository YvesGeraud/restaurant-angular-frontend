import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Configuracion, ConfiguracionFormData } from '../models/configuracion.model';

export interface ApiResponse<T> {
  exito: boolean;
  datos: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/configuracion`;

  obtener(): Observable<ApiResponse<Configuracion>> {
    return this.http.get<ApiResponse<Configuracion>>(this.apiUrl);
  }

  actualizar(data: ConfiguracionFormData): Observable<ApiResponse<Configuracion>> {
    return this.http.patch<ApiResponse<Configuracion>>(this.apiUrl, data);
  }
}
