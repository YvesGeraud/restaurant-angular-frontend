import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, map } from 'rxjs';

export interface EstadisticasVentas {
  totalVentas: number;
  totalOrdenes: number;
  ticketPromedio: number;
  platilloFavorito: string;
}

interface ApiResponse<T> {
  datos: T;
  mensaje?: string;
  exito: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly excelUrl = `${environment.apiUrl}/excel`;
  private readonly pdfUrl = `${environment.apiUrl}/pdf`;
  private readonly reportesUrl = `${environment.apiUrl}/reportes`;

  getEstadisticas(fechaInicio?: string, fechaFin?: string): Observable<EstadisticasVentas> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);

    return this.http
      .get<ApiResponse<EstadisticasVentas>>(`${this.reportesUrl}/stats`, { params })
      .pipe(map((res) => res.datos));
  }

  descargarExcelVentas(fechaInicio?: string, fechaFin?: string): void {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);

    this.http
      .get(`${this.excelUrl}/ventas`, {
        params,
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe((response: HttpResponse<Blob>) => {
        this.descargarArchivo(response.body, 'reporte-ventas.xlsx');
      });
  }

  descargarPdfVentas(fechaInicio?: string, fechaFin?: string): void {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);

    this.http
      .get(`${this.pdfUrl}/ventas`, {
        params,
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe((response: HttpResponse<Blob>) => {
        this.descargarArchivo(response.body, 'reporte-ventas.pdf');
      });
  }

  private descargarArchivo(blob: Blob | null, nombre: string): void {
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
