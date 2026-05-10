import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Categoria } from './categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private readonly apiUrl = `${environment.apiUrl}/categorias`;
  private readonly http = inject(HttpClient);

  getCategorias(estado?: boolean): Observable<Categoria[]> {
    let params = new HttpParams();
    params = params.set('limite', '100'); 
    if (estado !== undefined) {
      params = params.set('estado', estado ? 'true' : 'false');
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        const datos = response.datos || [];
        return datos.map((c: any) => ({
          ...c,
          id: c.id || c.id_ct_categoria
        }));
      })
    );
  }
}
