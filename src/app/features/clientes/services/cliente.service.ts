import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Cliente, ClienteFormData, FiltrosClientes } from '../models/cliente.model';
import { PaginatedResponse } from '@shared/models/pagination.model';

export interface ApiResponse<T> {
  exito: boolean;
  datos: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  getClientes(filtros: FiltrosClientes = {}): Observable<PaginatedResponse<Cliente>> {
    const params = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return this.http.get<PaginatedResponse<Cliente>>(this.apiUrl, { params });
  }

  crear(data: ClienteFormData): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(this.apiUrl, data);
  }

  actualizar(id: number, data: Partial<ClienteFormData>): Observable<ApiResponse<Cliente>> {
    return this.http.patch<ApiResponse<Cliente>>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
