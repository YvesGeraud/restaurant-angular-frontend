export interface Rol {
  id_ct_rol: number;
  nombre: string;
  descripcion?: string;
}

export interface Permiso {
  id_ct_permiso: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface Usuario {
  id_ct_usuario: number;
  usuario: string;
  email: string | null;
  nombre_completo: string;
  id_ct_rol: number;
  estado: boolean;
  fecha_reg: string;
  ct_rol: Rol;
}

export interface UsuarioFormData {
  usuario: string;
  contrasena?: string;
  email: string | null;
  nombre_completo: string;
  id_ct_rol: number;
  estado: boolean;
}

export interface FiltrosUsuarios {
  usuario?: string;
  id_ct_rol?: number;
  estado?: boolean;
}
