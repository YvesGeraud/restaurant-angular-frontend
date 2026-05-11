/**
 * REPRESENTACIÓN DE DOMINIO
 * Este es el modelo principal que se utiliza en toda la aplicación (UI, lógica de negocio, etc.)
 * Contiene la información procesada y amigable, incluyendo objetos anidados completos.
 */
export interface Mesa {
  id?: number;
  codigo: string;
  capacidad: number;
  status: string; // 'libre' | 'ocupada' | 'reservada'
  estado: boolean; // true = Activa, false = Inactiva/Baja
}

/**
 * MODELO PARA FORMULARIOS (UI)
 */
export interface MesaFormData {
  codigo: string;
  capacidad: number;
  status: string;
  estado?: boolean;
}

/**
 * DATA TRANSFER OBJECT (RECEPCIÓN)
 */
export interface MesaDTO {
  id_ct_mesa: number;
  codigo: string;
  capacidad: number;
  status: string;
  estado: boolean;
}

/**
 * DATA TRANSFER OBJECT (ENVÍO)
 */
export interface MesaPayloadDTO {
  codigo: string;
  capacidad: number;
  status: string;
  estado?: boolean;
}
