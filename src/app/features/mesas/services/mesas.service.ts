import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { environment } from "@environments/environment";
import { Mesa, MesaFormData, MesaDTO, MesaPayloadDTO } from "../models/mesa.model";
import { FiltrosMesas } from "../store/mesa.store";
import { ResultadoBatch } from "@shared/models/batch_result.model";
import { PaginatedResponse } from "@shared/models/pagination.model";

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

    /**
     * Transforma un objeto que viene del API (snake_case) a un objeto de dominio (camelCase).
     * @param dto Datos crudos del API
     * @returns Objeto tipo Mesa para usar en la UI
     */
    private mapFromApi(dto: MesaDTO): Mesa {
        return {
            id: dto.id_ct_mesa,
            codigo: dto.codigo,
            capacidad: dto.capacidad,
            status: dto.status,
            estado: dto.estado
        };
    }

    /**
     * Transforma los datos del formulario al formato de envío (payload) que espera el API.
     * @param data Datos del formulario de Angular
     * @returns Objeto preparado para ser enviado vía POST/PATCH
     */
    private mapToApiPayload(data: Partial<MesaFormData>): MesaPayloadDTO {
        const payload: any = {};
        
        if (data.codigo !== undefined) payload.codigo = data.codigo;
        if (data.capacidad !== undefined) payload.capacidad = Number(data.capacidad);
        if (data.status !== undefined) payload.status = data.status;
        if (data.estado !== undefined) payload.estado = data.estado;

        return payload as MesaPayloadDTO;
    }

    // ==========================================
    //            MÉTODOS DEL API
    // ==========================================

    /**
     * Obtiene una lista paginada de mesas.
     * @param filtros Criterios opcionales de búsqueda y paginación
     * @returns Observable con la respuesta paginada y mapeada
     */
    getMesas(filtros?: Partial<FiltrosMesas>): Observable<PaginatedResponse<Mesa>> {
        let params = {};
        if (filtros) {
            params = Object.fromEntries(
                Object.entries(filtros).filter(([_, v]) => v != null)
            );
        }

        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(response => {
                const list = response.datos || [];
                const meta = response.meta || {};
                return {
                    datos: list.map((dto: MesaDTO) => this.mapFromApi(dto)),
                    pagina: meta.pagina,
                    totalPaginas: meta.totalPaginas,
                    totalRegistros: meta.totalRegistros,
                    porPagina: meta.porPagina
                } as PaginatedResponse<Mesa>;
            })
        );
    }

    /**
     * Obtiene el detalle de una mesa específica por su ID.
     * @param id Identificador único de la mesa
     */
    getMesaById(id: number): Observable<Mesa> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => this.mapFromApi(response.datos))
        );
    }

    /**
     * Crea una nueva mesa en el sistema.
     * @param data Datos provenientes del formulario
     */
    createMesa(data: MesaFormData): Observable<Mesa> {
        return this.http.post<any>(this.apiUrl, this.mapToApiPayload(data)).pipe(
            map(response => this.mapFromApi(response.datos))
        );
    }

    /**
     * Crea múltiples platillos de forma masiva.
     * @param data Arreglo de datos de formularios
     */
    createMesasBatch(data: MesaFormData[]): Observable<ResultadoBatch> {
        const payloads = data.map(item => this.mapToApiPayload(item));
        return this.http.post<any>(`${this.apiUrl}/batch`, payloads).pipe(
            map(response => response.datos as ResultadoBatch)
        );
    }

    /**
     * Actualiza la información de una mesa existente.
     * @param id ID de la mesa a modificar
     * @param data Nuevos datos (parciales o totales)
     */
    updateMesa(id: number, data: Partial<MesaFormData>): Observable<Mesa> {
        return this.http.patch<any>(`${this.apiUrl}/${id}`, this.mapToApiPayload(data)).pipe(
          map(response => this.mapFromApi(response.datos))
        );
      }

    /**
     * Elimina una mesa del sistema.
     * @param id ID de la mesa a eliminar
     */
    deleteMesa(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}