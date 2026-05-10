export interface User {
  id: number;
  usuario: string;
  email: string | null;
  nombreCompleto: string;
  idRol: number;
  rol: string;
  permisos: string[];
}

export interface AuthCredentials {
  usuario: string;
  contrasena: string;
}

export interface AuthResponse {
  usuario: User;
}
