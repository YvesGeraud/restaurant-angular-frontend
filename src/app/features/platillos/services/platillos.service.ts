import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Platillo,
  PlatilloFormData,
  PlatilloDTO,
  PlatilloPayloadDTO,
} from '../models/platillo.model';
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
 * SERVICIO DE PLATILLOS
 * Encargado de la comunicación con el API para todas las operaciones CRUD de platillos.
 * Realiza el mapeo entre los modelos del API (DTO) y los modelos de la aplicación (Dominio/Forms).
 */
@Injectable({
  providedIn: 'root'
})
export class PlatillosService {
  private readonly apiUrl = `${environment.apiUrl}/platillos`;
  private readonly http = inject(HttpClient);

  // ==========================================
  //            MAPPERS LOCALES
  // ==========================================

  private mapFromApi(dto: PlatilloDTO): Platillo {
    return {
      id: dto.id_ct_platillo,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? '',
      precio: Number(dto.precio),
      imagenUrl: dto.imagen_url ?? '',
      estado: dto.estado,
      categoria: dto.ct_categoria
        ? { id: dto.ct_categoria.id_ct_categoria, nombre: dto.ct_categoria.nombre }
        : { id: 0, nombre: 'Sin categoría' },
    };
  }

  private mapToApiPayload(data: Partial<PlatilloFormData>): PlatilloPayloadDTO {
    const payload: Partial<PlatilloPayloadDTO> = {};

    if (data.idCategoria !== undefined) payload.id_ct_categoria = Number(data.idCategoria);
    if (data.nombre !== undefined) payload.nombre = data.nombre;
    if (data.descripcion !== undefined) payload.descripcion = data.descripcion || undefined;
    if (data.precio !== undefined) payload.precio = Number(data.precio);
    if (data.imagenUrl !== undefined) payload.imagen_url = data.imagenUrl?.trim() || null;
    if (data.estado !== undefined) payload.estado = data.estado;

    return payload as PlatilloPayloadDTO;
  }

  // ==========================================
  //            MÉTODOS DEL API
  // ==========================================

  getPlatillos(filtros?: {
    busqueda?: string;
    pagina?: number;
    limite?: number;
    id_ct_categoria?: number;
  }): Observable<PaginatedResponse<Platillo>> {
    let params = {};
    if (filtros) {
      params = Object.fromEntries(
        Object.entries(filtros).filter(([key, v]) => key !== '' && v != null),
      );
    }

    return this.http.get<ApiResponse<PlatilloDTO[]>>(this.apiUrl, { params }).pipe(
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
        } as PaginatedResponse<Platillo>;
      }),
    );
  }

  getPlatilloById(id: number): Observable<Platillo> {
    return this.http
      .get<ApiResponse<PlatilloDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => this.mapFromApi(response.datos)));
  }

  createPlatillo(data: PlatilloFormData): Observable<Platillo> {
    return this.http
      .post<ApiResponse<PlatilloDTO>>(this.apiUrl, this.mapToApiPayload(data))
      .pipe(map((response) => this.mapFromApi(response.datos)));
  }

  createPlatillosBatch(data: PlatilloFormData[]): Observable<ResultadoBatch> {
    const payloads = data.map((item) => this.mapToApiPayload(item));
    return this.http
      .post<ApiResponse<ResultadoBatch>>(`${this.apiUrl}/batch`, payloads)
      .pipe(map((response) => response.datos));
  }

  updatePlatillo(id: number, data: Partial<PlatilloFormData>): Observable<Platillo> {
    return this.http
      .patch<ApiResponse<PlatilloDTO>>(`${this.apiUrl}/${id}`, this.mapToApiPayload(data))
      .pipe(map((response) => this.mapFromApi(response.datos)));
  }

  deletePlatillo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
