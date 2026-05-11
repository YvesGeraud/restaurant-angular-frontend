import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Mesa, MesaFormData, MesaDTO, MesaPayloadDTO } from '../models/mesa.model';
import { FiltrosMesas } from '../store/mesa.store';
import { ResultadoBatch } from '@shared/models/batch_result.model';
import { PaginatedResponse } from '@shared/models/pagination.model';

interface ApiResponse<T> {
  datos: T;
  meta?: {
    pagina: number;
    totalPaginas: number;
    totalRegistros: number;
    porPagina: number;
  };
  mensaje?: string;
  exito: boolean;
}

/**
 * SERVICIO DE MESAS
 * Encargado de la comunicación con el API para todas las operaciones CRUD de mesas.
 * Realiza el mapeo entre los modelos del API (DTO) y los modelos de la aplicación (Dominio/Forms).
 */
@Injectable()
export class MesasService {
  private readonly apiUrl = `${environment.apiUrl}/mesas`;
  private readonly http = inject(HttpClient);

  // ==========================================
  //            MAPPERS LOCALES
  // ==========================================

  private mapFromApi(dto: MesaDTO): Mesa {
    return {
      id: dto.id_ct_mesa,
      codigo: dto.codigo,
      capacidad: dto.capacidad,
      status: dto.status,
      estado: dto.estado,
    };
  }

  private mapToApiPayload(data: Partial<MesaFormData>): MesaPayloadDTO {
    const payload: Partial<MesaPayloadDTO> = {};

    if (data.codigo !== undefined) payload.codigo = data.codigo;
    if (data.capacidad !== undefined) payload.capacidad = Number(data.capacidad);
    if (data.status !== undefined) payload.status = data.status;
    if (data.estado !== undefined) payload.estado = data.estado;

    return payload as MesaPayloadDTO;
  }

  // ==========================================
  //            MÉTODOS DEL API
  // ==========================================

  getMesas(filtros?: Partial<FiltrosMesas>): Observable<PaginatedResponse<Mesa>> {
    let params = {};
    if (filtros) {
      params = Object.fromEntries(
        Object.entries(filtros).filter(([key, v]) => key !== '' && v != null),
      );
    }

    return this.http.get<ApiResponse<MesaDTO[]>>(this.apiUrl, { params }).pipe(
      map((response) => {
        const list = response.datos || [];
        const meta = response.meta || {
          pagina: 1,
          totalPaginas: 1,
          totalRegistros: 0,
          porPagina: 10,
        };
        return {
          datos: list.map((dto) => this.mapFromApi(dto)),
          pagina: meta.pagina,
          totalPaginas: meta.totalPaginas,
          totalRegistros: meta.totalRegistros,
          porPagina: meta.porPagina,
        } as PaginatedResponse<Mesa>;
      }),
    );
  }

  getMesaById(id: number): Observable<Mesa> {
    return this.http
      .get<ApiResponse<MesaDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => this.mapFromApi(response.datos)));
  }

  createMesa(data: MesaFormData): Observable<Mesa> {
    return this.http
      .post<ApiResponse<MesaDTO>>(this.apiUrl, this.mapToApiPayload(data))
      .pipe(map((response) => this.mapFromApi(response.datos)));
  }

  createMesasBatch(data: MesaFormData[]): Observable<ResultadoBatch> {
    const payloads = data.map((item) => this.mapToApiPayload(item));
    return this.http
      .post<ApiResponse<ResultadoBatch>>(`${this.apiUrl}/batch`, payloads)
      .pipe(map((response) => response.datos));
  }

  updateMesa(id: number, data: Partial<MesaFormData>): Observable<Mesa> {
    return this.http
      .patch<ApiResponse<MesaDTO>>(`${this.apiUrl}/${id}`, this.mapToApiPayload(data))
      .pipe(map((response) => this.mapFromApi(response.datos)));
  }

  deleteMesa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
