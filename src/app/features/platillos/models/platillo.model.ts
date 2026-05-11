import { Categoria } from '@shared/categorias/categoria.model';

/**
 * REPRESENTACIÓN DE DOMINIO
 * Este es el modelo principal que se utiliza en toda la aplicación (UI, lógica de negocio, etc.)
 * Contiene la información procesada y amigable, incluyendo objetos anidados completos.
 */
export interface Platillo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  estado: boolean;
  categoria: Categoria; // Objeto completo con id y nombre
}

/**
 * MODELO PARA FORMULARIOS (UI)
 * Se utiliza exclusivamente en los componentes de Angular que manejan formularios (ej. FormGroup).
 * A diferencia del modelo de dominio, aquí usamos IDs planos (idCategoria) para facilitar
 * el enlace con componentes como <select>.
 */
export interface PlatilloFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  idCategoria: number; // Solo el ID para el select de categorías
  estado?: boolean;
}

/**
 * DATA TRANSFER OBJECT (RECEPCIÓN)
 * Representa la estructura exacta que devuelve el API (desde el backend/base de datos).
 * Se utiliza en los servicios para tipar la respuesta HTTP antes de ser mapeada al modelo de dominio.
 * Nota: Los nombres suelen seguir la convención snake_case de la DB.
 */
export interface PlatilloDTO {
  id_ct_platillo: number;
  id_ct_categoria: number;
  nombre: string;
  descripcion: string | null;
  precio: number | string;
  imagen_url: string | null;
  estado: boolean;
  ct_categoria: {
    id_ct_categoria: number;
    nombre: string;
  };
}

/**
 * DATA TRANSFER OBJECT (ENVÍO)
 * Es el "payload" o cuerpo de datos que el frontend envía al API en peticiones POST o PUT.
 * Sigue la estructura que espera el controlador del backend.
 */
export interface PlatilloPayloadDTO {
  id_ct_categoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string | null;
  estado: boolean;
}
