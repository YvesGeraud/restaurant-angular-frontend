import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, map } from 'rxjs';

export interface OcupacionMesas {
  ocupadas: number;
  total: number;
  porcentaje: number;
}

export interface TopPlatillo {
  nombre: string;
  cantidad: number;
}

export interface VentaDia {
  fecha: string;
  total: number;
}

export interface DashboardStats {
  ventasHoy: number;
  ordenesHoy: number;
  ticketPromedioHoy: number;
  ocupacionMesas: OcupacionMesas;
  top5Platillos: TopPlatillo[];
  ventasUltimos7Dias: VentaDia[];
}

interface ApiResponse<T> {
  datos: T;
  mensaje?: string;
  exito: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http
      .get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`)
      .pipe(map((res) => res.datos));
  }
}
