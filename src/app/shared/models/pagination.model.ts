export interface PaginationMeta {
  pagina: number;
  totalPaginas: number;
  totalRegistros: number;
  porPagina: number;
}

export interface PaginatedResponse<T> {
  datos: T[];
  pagina: number;
  totalPaginas: number;
  totalRegistros: number;
  porPagina: number;
}
