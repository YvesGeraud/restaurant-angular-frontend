export interface ReservacionBase {
  id_ct_cliente: number;
  id_ct_mesa: number;
  num_personas: number;
  fecha_reservacion: string; // ISO 8601
  notas?: string;
}

export interface Reservacion extends ReservacionBase {
  id_rl_reservacion: number;
  id_ct_estado_reservacion: number;
  clave_intento_pago?: string | null;
  fecha_reg: string;
}

export interface IniciarPagoPayload {
  monto_centavos: number;
  moneda?: string;
}

export interface IniciarPagoResponse {
  success: boolean;
  mensaje: string;
  datos: {
    client_secret: string;
    clave_intento_pago: string;
  };
}
