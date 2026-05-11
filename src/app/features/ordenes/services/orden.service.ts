import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Orden, CrearOrdenFormData, FiltrosOrdenes, EstadoOrden } from '../models/orden.model';
import { PaginatedResponse } from '@shared/models/pagination.model';

interface OrdenDTO {
  id_rl_orden: number;
  id_ct_mesa: number;
  id_ct_usuario: number;
  total: string | number;
  estado: EstadoOrden;
  fecha_reg: string;
  dt_detalle_orden?: {
    id_ct_platillo: number;
    cantidad: number;
    precio_unitario: string | number;
    subtotal: string | number;
    ct_platillo?: {
      id_ct_platillo: number;
      nombre: string;
      imagen_url?: string;
    };
  }[];
  ct_mesa?: {
    id_ct_mesa: number;
    codigo: string;
  };
}

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
 * SERVICIO DE ÓRDENES
 * Encargado de la comunicación con el API para todas las operaciones CRUD de órdenes.
 * Realiza el mapeo entre los modelos del API (DTO) y los modelos de la aplicación (Dominio).
 */
@Injectable({
  providedIn: 'root',
})
export class OrdenService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ordenes`;

  /**
   * Obtiene una lista paginada de órdenes.
   */
  getOrdenes(filtros: FiltrosOrdenes = {}): Observable<PaginatedResponse<Orden>> {
    const cleanParams = Object.fromEntries(
      Object.entries(filtros).filter(
        ([key, v]) => key !== '' && v !== undefined && v !== null && v !== '',
      ),
    );
    return this.http.get<ApiResponse<OrdenDTO[]>>(this.apiUrl, { params: cleanParams }).pipe(
      map(
        (res) =>
          ({
            datos: (res.datos || []).map((o) => this.mapFromApi(o)),
            pagina: res.meta?.pagina || 1,
            totalPaginas: res.meta?.totalPaginas || 1,
            totalRegistros: res.meta?.totalRegistros || 0,
            porPagina: res.meta?.porPagina || 10,
          }) as PaginatedResponse<Orden>,
      ),
    );
  }

  getOrdenById(id: number): Observable<Orden> {
    return this.http
      .get<ApiResponse<OrdenDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => this.mapFromApi(res.datos)));
  }

  crear(data: CrearOrdenFormData): Observable<Orden> {
    return this.http
      .post<ApiResponse<OrdenDTO>>(this.apiUrl, data)
      .pipe(map((res) => this.mapFromApi(res.datos)));
  }

  actualizarEstado(id: number, estado: EstadoOrden): Observable<Orden> {
    return this.http
      .patch<ApiResponse<OrdenDTO>>(`${this.apiUrl}/${id}/estado`, { estado })
      .pipe(map((res) => this.mapFromApi(res.datos)));
  }

  actualizar(id: number, data: CrearOrdenFormData): Observable<Orden> {
    return this.http
      .put<ApiResponse<OrdenDTO>>(`${this.apiUrl}/${id}`, data)
      .pipe(map((res) => this.mapFromApi(res.datos)));
  }

  private mapFromApi(o: OrdenDTO): Orden {
    return {
      id_rl_orden: o.id_rl_orden,
      id_ct_mesa: o.id_ct_mesa,
      id_ct_usuario: o.id_ct_usuario,
      total: Number(o.total),
      estado: o.estado,
      fecha_reg: o.fecha_reg,
      detalles: (o.dt_detalle_orden || []).map((d) => ({
        id_ct_platillo: d.id_ct_platillo,
        cantidad: d.cantidad,
        precio_unitario: Number(d.precio_unitario),
        subtotal: Number(d.subtotal),
        platillo: d.ct_platillo
          ? {
              id_ct_platillo: d.ct_platillo.id_ct_platillo,
              nombre: d.ct_platillo.nombre,
              imagen_url: d.ct_platillo.imagen_url,
            }
          : undefined,
      })),
      mesa: o.ct_mesa
        ? {
            id_ct_mesa: o.ct_mesa.id_ct_mesa,
            codigo: o.ct_mesa.codigo,
          }
        : undefined,
    };
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
