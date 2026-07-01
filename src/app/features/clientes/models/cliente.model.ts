export interface Cliente {
  id_ct_cliente: number;
  nombre: string;
  correo: string;
  telefono: string;
  estado: boolean;
  fecha_reg: string;
}

export interface ClienteFormData {
  nombre: string;
  correo: string;
  telefono: string;
  estado?: boolean;
}

export interface FiltrosClientes {
  busqueda?: string;
  estado?: boolean;
}
