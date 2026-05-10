import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Platillo, PlatilloFormData, PlatilloDTO, PlatilloPayloadDTO } from '../models/platillo.model';
import { ResultadoBatch } from '@shared/models/batch_result.model';
import { PaginatedResponse } from '@shared/models/pagination.model';

/**
 * SERVICIO DE PLATILLOS
 * Encargado de la comunicación con el API para todas las operaciones CRUD de platillos.
 * Realiza el mapeo entre los modelos del API (DTO) y los modelos de la aplicación (Dominio/Forms).
 */
@Injectable()
export class PlatillosService {
  private readonly apiUrl = `${environment.apiUrl}/platillos`;
  private readonly http = inject(HttpClient);

  // ==========================================
  //            MAPPERS LOCALES
  // ==========================================

  /**
   * Transforma un objeto que viene del API (snake_case) a un objeto de dominio (camelCase).
   * @param dto Datos crudos del API
   * @returns Objeto tipo Platillo para usar en la UI
   */
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

  /**
   * Transforma los datos del formulario al formato de envío (payload) que espera el API.
   * @param data Datos del formulario de Angular
   * @returns Objeto preparado para ser enviado vía POST/PATCH
   */
  private mapToApiPayload(data: Partial<PlatilloFormData>): PlatilloPayloadDTO {
    const payload: any = {};

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

  /**
   * Obtiene una lista paginada de platillos.
   * @param filtros Criterios opcionales de búsqueda y paginación
   * @returns Observable con la respuesta paginada y mapeada
   */
  getPlatillos(filtros?: { busqueda?: string; pagina?: number; limite?: number; id_ct_categoria?: number }): Observable<PaginatedResponse<Platillo>> {
    let params = {};
    if (filtros) {
      // Limpiamos los parámetros nulos o indefinidos
      params = Object.fromEntries(
        Object.entries(filtros).filter(([_, v]) => v != null)
      );
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        const list = response.datos || [];
        const meta = response.meta || {};
        return {
          datos: list.map((dto: PlatilloDTO) => this.mapFromApi(dto)),
          pagina: meta.pagina,
          totalPaginas: meta.totalPaginas,
          totalRegistros: meta.totalRegistros,
          porPagina: meta.porPagina
        } as PaginatedResponse<Platillo>;
      })
    );
  }

  /**
   * Obtiene el detalle de un platillo específico por su ID.
   * @param id Identificador único del platillo
   */
  getPlatilloById(id: number): Observable<Platillo> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.mapFromApi(response.datos))
    );
  }

  /**
   * Crea un nuevo platillo en el sistema.
   * @param data Datos provenientes del formulario
   */
  createPlatillo(data: PlatilloFormData): Observable<Platillo> {
    return this.http.post<any>(this.apiUrl, this.mapToApiPayload(data)).pipe(
      map(response => this.mapFromApi(response.datos))
    );
  }

  /**
   * Crea múltiples platillos de forma masiva.
   * @param data Arreglo de datos de formularios
   */
  createPlatillosBatch(data: PlatilloFormData[]): Observable<ResultadoBatch> {
    const payloads = data.map(item => this.mapToApiPayload(item));
    return this.http.post<any>(`${this.apiUrl}/batch`, payloads).pipe(
      map(response => response.datos as ResultadoBatch)
    );
  }

  /**
   * Actualiza la información de un platillo existente.
   * @param id ID del platillo a modificar
   * @param data Nuevos datos (parciales o totales)
   */
  updatePlatillo(id: number, data: Partial<PlatilloFormData>): Observable<Platillo> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, this.mapToApiPayload(data)).pipe(
      map(response => this.mapFromApi(response.datos))
    );
  }

  /**
   * Elimina un platillo del sistema.
   * @param id ID del platillo a eliminar
   */
  deletePlatillo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

