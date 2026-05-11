export interface ResultadoBatch {
  procesados: number;
  exitosos: number;
  fallidos: number;
  errores: ErrorBatch[];
}

export interface ErrorBatch {
  indice: number;
  error: string;
  dato?: unknown;
}
