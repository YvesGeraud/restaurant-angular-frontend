import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IniciarPagoPayload,
  IniciarPagoResponse,
  Reservacion,
  ReservacionBase,
} from '../models/reservacion.model';

@Injectable({
  providedIn: 'root',
})
export class ReservacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservaciones`;

  /**
   * Paso 1: Crear la reservación (retorna en estado PENDIENTE_PAGO)
   */
  crear(datos: ReservacionBase): Observable<{ exito: boolean; datos: Reservacion }> {
    return this.http.post<{ exito: boolean; datos: Reservacion }>(this.apiUrl, datos);
  }

  /**
   * Paso 2: Iniciar el pago en Stripe para una reservación específica
   */
  iniciarPago(idReservacion: number, payload: IniciarPagoPayload): Observable<IniciarPagoResponse> {
    return this.http.post<IniciarPagoResponse>(`${this.apiUrl}/${idReservacion}/pago`, payload);
  }

  /**
   * Obtiene la lista completa de reservaciones (para el Staff)
   */
  obtenerTodas(): Observable<{ exito: boolean; datos: Reservacion[] }> {
    return this.http.get<{ exito: boolean; datos: Reservacion[] }>(this.apiUrl);
  }

  /**
   * Actualiza el estado u otros campos de una reservación
   */
  actualizar(id: number, datos: { estado?: string; [key: string]: unknown }): Observable<{ exito: boolean }> {
    return this.http.patch<{ exito: boolean }>(`${this.apiUrl}/${id}`, datos);
  }

  /**
   * Cancela una reservación (elimina lógicamente en el backend)
   */
  eliminar(id: number): Observable<{ exito: boolean }> {
    return this.http.delete<{ exito: boolean }>(`${this.apiUrl}/${id}`);
  }
}
