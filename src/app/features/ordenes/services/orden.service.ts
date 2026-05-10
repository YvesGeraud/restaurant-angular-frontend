import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Orden, CrearOrdenFormData, FiltrosOrdenes, EstadoOrden } from '../models/orden.model';
import { PaginatedResponse } from '@shared/models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ordenes`;

  getOrdenes(filtros: FiltrosOrdenes = {}): Observable<PaginatedResponse<Orden>> {
    const cleanParams = Object.fromEntries(
      Object.entries(filtros).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    return this.http.get<any>(this.apiUrl, { params: cleanParams }).pipe(
      map(res => ({
        ...res,
        datos: res.datos.map((o: any) => this.mapFromApi(o))
      }))
    );
  }

  getOrdenById(id: number): Observable<Orden> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.mapFromApi(res.datos))
    );
  }

  crear(data: CrearOrdenFormData): Observable<Orden> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => this.mapFromApi(res.datos))
    );
  }

  actualizarEstado(id: number, estado: EstadoOrden): Observable<Orden> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estado`, { estado }).pipe(
      map(res => this.mapFromApi(res.datos))
    );
  }

  actualizar(id: number, data: CrearOrdenFormData): Observable<Orden> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => this.mapFromApi(res.datos))
    );
  }

  private mapFromApi(o: any): Orden {
    return {
      id_rl_orden: o.id_rl_orden,
      id_ct_mesa: o.id_ct_mesa,
      id_ct_usuario: o.id_ct_usuario,
      total: Number(o.total),
      estado: o.estado,
      fecha_reg: o.fecha_reg,
      detalles: (o.dt_detalle_orden || []).map((d: any) => ({
        id_ct_platillo: d.id_ct_platillo,
        cantidad: d.cantidad,
        precio_unitario: Number(d.precio_unitario),
        subtotal: Number(d.subtotal),
        platillo: d.ct_platillo ? {
          id_ct_platillo: d.ct_platillo.id_ct_platillo,
          nombre: d.ct_platillo.nombre,
          imagen_url: d.ct_platillo.imagen_url
        } : undefined
      }))
    };
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
