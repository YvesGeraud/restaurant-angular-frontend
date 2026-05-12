export type EstadoOrden =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'LISTO'
  | 'ENTREGADO'
  | 'PAGADA'
  | 'CANCELADO';

import { Platillo } from '../../platillos/models/platillo.model';

export interface DetalleOrden {
  id_ct_platillo: number;
  cantidad: number;
  precio_unitario?: number;
  subtotal?: number;
  platillo?: {
    id_ct_platillo: number;
    nombre: string;
    imagen_url?: string;
  };
}

export interface ItemCarrito extends Platillo {
  cantidad: number;
}

export interface Orden {
  id_rl_orden: number;
  id_ct_mesa?: number;
  id_ct_usuario: number;
  total: number;
  estado: EstadoOrden;
  fecha_reg: string;
  detalles: DetalleOrden[];
  mesa?: {
    id_ct_mesa: number;
    codigo: string;
  };
}

export interface CrearOrdenFormData {
  id_mesa?: number;
  detalles: {
    id_ct_platillo: number;
    cantidad: number;
  }[];
}

export interface FiltrosOrdenes {
  pagina?: number;
  limite?: number;
  estado?: EstadoOrden;
  id_mesa?: number;
}
