export interface Configuracion {
  id_ct_configuracion?: number;
  nombre_restaurante: string;
  logo_url: string | null;
  telefono: string | null;
  direccion: string | null;
  email_contacto: string | null;
  horario_apertura: string | null;
  horario_cierre: string | null;
  moneda: string;
  impuesto_porcentaje: number;
}

export type ConfiguracionFormData = Partial<Omit<Configuracion, 'id_ct_configuracion'>>;
