export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Fecha y hora en formato ISO 8601 (ej: "2025-05-24T03:00:00.000Z") */
  DateTime: { input: unknown; output: unknown; }
  /** Número decimal de precisión arbitraria (precios, totales) */
  Decimal: { input: unknown; output: unknown; }
};

export type ActualizarEstadoOrdenInput = {
  estado: EstadoOrden;
};

export type ActualizarPlatilloInput = {
  descripcion?: InputMaybe<Scalars['String']['input']>;
  estado?: InputMaybe<Scalars['Boolean']['input']>;
  id_ct_categoria?: InputMaybe<Scalars['Int']['input']>;
  imagen_url?: InputMaybe<Scalars['String']['input']>;
  nombre?: InputMaybe<Scalars['String']['input']>;
  precio?: InputMaybe<Scalars['Float']['input']>;
};

export type ActualizarReservacionInput = {
  estado?: InputMaybe<Scalars['String']['input']>;
  fecha_reservacion?: InputMaybe<Scalars['DateTime']['input']>;
  id_ct_mesa?: InputMaybe<Scalars['Int']['input']>;
  notas?: InputMaybe<Scalars['String']['input']>;
  num_personas?: InputMaybe<Scalars['Int']['input']>;
};

/** Categoría de platillos (ej: Entradas, Platos Fuertes, Bebidas) */
export type Categoria = {
  __typename?: 'Categoria';
  descripcion?: Maybe<Scalars['String']['output']>;
  estado: Scalars['Boolean']['output'];
  fecha_reg: Scalars['DateTime']['output'];
  id_ct_categoria: Scalars['Int']['output'];
  nombre: Scalars['String']['output'];
  /**  Platillos activos que pertenecen a esta categoría  */
  platillos: Array<Platillo>;
};

/** Cliente que realiza la reservación (ct_cliente) */
export type Cliente = {
  __typename?: 'Cliente';
  correo: Scalars['String']['output'];
  estado: Scalars['Boolean']['output'];
  id_ct_cliente: Scalars['Int']['output'];
  nombre: Scalars['String']['output'];
  telefono: Scalars['String']['output'];
};

export type ClienteInput = {
  correo: Scalars['String']['input'];
  nombre: Scalars['String']['input'];
  telefono: Scalars['String']['input'];
};

export type CrearOrdenInput = {
  detalles: Array<ItemOrdenInput>;
  /**  ID de mesa (null si es orden para llevar)  */
  id_mesa?: InputMaybe<Scalars['Int']['input']>;
};

export type CrearPlatilloInput = {
  descripcion?: InputMaybe<Scalars['String']['input']>;
  id_ct_categoria: Scalars['Int']['input'];
  imagen_url?: InputMaybe<Scalars['String']['input']>;
  nombre: Scalars['String']['input'];
  precio: Scalars['Float']['input'];
};

export type CrearReservacionInput = {
  cliente?: InputMaybe<ClienteInput>;
  fecha_reservacion: Scalars['DateTime']['input'];
  id_ct_cliente?: InputMaybe<Scalars['Int']['input']>;
  id_ct_mesa?: InputMaybe<Scalars['Int']['input']>;
  notas?: InputMaybe<Scalars['String']['input']>;
  num_personas: Scalars['Int']['input'];
};

/** Detalle de un platillo dentro de una orden */
export type DetalleOrden = {
  __typename?: 'DetalleOrden';
  cantidad: Scalars['Int']['output'];
  id_dt_detalle_orden: Scalars['Int']['output'];
  /**  Platillo correspondiente (resuelto via DataLoader)  */
  platillo: Platillo;
  precio_unitario: Scalars['Decimal']['output'];
  subtotal: Scalars['Decimal']['output'];
};

/** Estado posible de una orden (espejo del enum Prisma rl_orden_estado) */
export type EstadoOrden =
  | 'CANCELADO'
  | 'ENTREGADO'
  | 'EN_PROCESO'
  | 'LISTO'
  | 'PAGADA'
  | 'PENDIENTE';

/** Estado de la reservación (catálogo ct_estado_reservacion) */
export type EstadoReservacion = {
  __typename?: 'EstadoReservacion';
  clave: Scalars['String']['output'];
  descripcion?: Maybe<Scalars['String']['output']>;
  id_ct_estado_reservacion: Scalars['Int']['output'];
  implica_pago_activo: Scalars['Boolean']['output'];
  nombre: Scalars['String']['output'];
};

export type FiltrosOrdenesInput = {
  estado?: InputMaybe<EstadoOrden>;
  id_ct_usuario?: InputMaybe<Scalars['Int']['input']>;
  id_mesa?: InputMaybe<Scalars['Int']['input']>;
  limite?: InputMaybe<Scalars['Int']['input']>;
  pagina?: InputMaybe<Scalars['Int']['input']>;
};

export type FiltrosPlatillosInput = {
  /**  Búsqueda por nombre o descripción  */
  busqueda?: InputMaybe<Scalars['String']['input']>;
  /**  Filtrar por estado activo/inactivo (default: true)  */
  estado?: InputMaybe<Scalars['Boolean']['input']>;
  /**  Filtrar por categoría  */
  id_ct_categoria?: InputMaybe<Scalars['Int']['input']>;
  limite?: InputMaybe<Scalars['Int']['input']>;
  pagina?: InputMaybe<Scalars['Int']['input']>;
};

export type FiltrosReservacionesInput = {
  clave_estado?: InputMaybe<Scalars['String']['input']>;
  id_ct_cliente?: InputMaybe<Scalars['Int']['input']>;
  id_ct_mesa?: InputMaybe<Scalars['Int']['input']>;
  limite?: InputMaybe<Scalars['Int']['input']>;
  orden?: InputMaybe<Scalars['String']['input']>;
  ordenar_por?: InputMaybe<Scalars['String']['input']>;
  pagina?: InputMaybe<Scalars['Int']['input']>;
};

export type ItemOrdenInput = {
  cantidad: Scalars['Int']['input'];
  id_ct_platillo: Scalars['Int']['input'];
};

/** Mesa del restaurante */
export type Mesa = {
  __typename?: 'Mesa';
  capacidad: Scalars['Int']['output'];
  codigo: Scalars['String']['output'];
  estado: Scalars['Boolean']['output'];
  id_ct_mesa: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /**  Actualizar campos de un platillo (requiere autenticación)  */
  actualizarPlatillo: Platillo;
  /**  Actualizar datos de una reservación (requiere autenticación)  */
  actualizarReservacion: Reservacion;
  /**  Actualizar el estado de una orden (requiere autenticación)  */
  cambiarEstadoOrden: Orden;
  /**  Cancelar una orden — equivale a cambiar estado a CANCELADO (requiere autenticación)  */
  cancelarOrden: Orden;
  /**  Crear una nueva orden completa con sus detalles (requiere autenticación)  */
  crearOrden: Orden;
  /**  Crear un nuevo platillo (requiere autenticación)  */
  crearPlatillo: Platillo;
  /**  Crear una reservación (admite creación pública/sistema)  */
  crearReservacion: Reservacion;
  /**  Desactivar un platillo — soft delete (requiere autenticación)  */
  eliminarPlatillo: Scalars['Boolean']['output'];
  /**  Cancelar reservación/eliminar (requiere autenticación)  */
  eliminarReservacion: Scalars['Boolean']['output'];
};


export type MutationActualizarPlatilloArgs = {
  id: Scalars['Int']['input'];
  input: ActualizarPlatilloInput;
};


export type MutationActualizarReservacionArgs = {
  id: Scalars['Int']['input'];
  input: ActualizarReservacionInput;
};


export type MutationCambiarEstadoOrdenArgs = {
  id: Scalars['Int']['input'];
  input: ActualizarEstadoOrdenInput;
};


export type MutationCancelarOrdenArgs = {
  id: Scalars['Int']['input'];
};


export type MutationCrearOrdenArgs = {
  input: CrearOrdenInput;
};


export type MutationCrearPlatilloArgs = {
  input: CrearPlatilloInput;
};


export type MutationCrearReservacionArgs = {
  input: CrearReservacionInput;
};


export type MutationEliminarPlatilloArgs = {
  id: Scalars['Int']['input'];
};


export type MutationEliminarReservacionArgs = {
  id: Scalars['Int']['input'];
};

/** Orden del restaurante con todos sus detalles */
export type Orden = {
  __typename?: 'Orden';
  /**  Platillos incluidos en la orden  */
  detalles: Array<DetalleOrden>;
  estado: EstadoOrden;
  fecha_mod?: Maybe<Scalars['DateTime']['output']>;
  fecha_reg: Scalars['DateTime']['output'];
  id_ct_usuario_mod?: Maybe<Scalars['Int']['output']>;
  /**  IDs de auditoría para filtrado de notificaciones  */
  id_ct_usuario_reg: Scalars['Int']['output'];
  id_rl_orden: Scalars['Int']['output'];
  /**  Mesa asignada (null si es orden para llevar)  */
  mesa?: Maybe<Mesa>;
  total: Scalars['Decimal']['output'];
  /**  Mesero que tomó la orden  */
  usuario: UsuarioResumen;
};

/** Platillo del menú del restaurante */
export type Platillo = {
  __typename?: 'Platillo';
  /**  Categoría a la que pertenece (resuelta via DataLoader — sin N+1)  */
  categoria: Categoria;
  descripcion?: Maybe<Scalars['String']['output']>;
  estado: Scalars['Boolean']['output'];
  fecha_reg: Scalars['DateTime']['output'];
  id_ct_platillo: Scalars['Int']['output'];
  imagen_url?: Maybe<Scalars['String']['output']>;
  nombre: Scalars['String']['output'];
  precio: Scalars['Decimal']['output'];
};

/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type Query = {
  __typename?: 'Query';
  /**  Obtener una categoría por ID  */
  categoria?: Maybe<Categoria>;
  /**  Obtener todas las categorías (activas por defecto)  */
  categorias: Array<Categoria>;
  /**  Mesa por ID  */
  mesa?: Maybe<Mesa>;
  /**  Lista de mesas (activas por defecto)  */
  mesas: Array<Mesa>;
  /**  Orden específica por ID (requiere autenticación)  */
  orden?: Maybe<Orden>;
  /**  Lista de órdenes con filtros opcionales (requiere autenticación)  */
  ordenes: Array<Orden>;
  /**  Platillo específico por ID  */
  platillo?: Maybe<Platillo>;
  /**  Lista de platillos con filtros opcionales  */
  platillos: Array<Platillo>;
  /**  Obtener reservación por ID (requiere autenticación)  */
  reservacion?: Maybe<Reservacion>;
  /**  Obtener todas las reservaciones con filtros y paginación (requiere autenticación)  */
  reservaciones: Array<Reservacion>;
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryCategoriaArgs = {
  id: Scalars['Int']['input'];
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryCategoriasArgs = {
  soloActivas?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryMesaArgs = {
  id: Scalars['Int']['input'];
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryMesasArgs = {
  soloActivas?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryOrdenArgs = {
  id: Scalars['Int']['input'];
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryOrdenesArgs = {
  filtros?: InputMaybe<FiltrosOrdenesInput>;
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryPlatilloArgs = {
  id: Scalars['Int']['input'];
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryPlatillosArgs = {
  filtros?: InputMaybe<FiltrosPlatillosInput>;
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryReservacionArgs = {
  id: Scalars['Int']['input'];
};


/**
 * Schema raíz — define los tipos de operación.
 * Cada módulo extiende Query / Mutation / Subscription con sus propios campos.
 */
export type QueryReservacionesArgs = {
  filtros?: InputMaybe<FiltrosReservacionesInput>;
};

/** Reservación registrada en el sistema (rl_reservacion) */
export type Reservacion = {
  __typename?: 'Reservacion';
  clave_intento_pago?: Maybe<Scalars['String']['output']>;
  cliente: Cliente;
  estado: EstadoReservacion;
  estado_pago_stripe?: Maybe<Scalars['String']['output']>;
  fecha_mod?: Maybe<Scalars['DateTime']['output']>;
  fecha_reg: Scalars['DateTime']['output'];
  fecha_reservacion: Scalars['DateTime']['output'];
  horas_gracia_cancelacion: Scalars['Int']['output'];
  id_rl_reservacion: Scalars['Int']['output'];
  mesa?: Maybe<Mesa>;
  monto_deposito_centavos?: Maybe<Scalars['Int']['output']>;
  notas?: Maybe<Scalars['String']['output']>;
  num_personas: Scalars['Int']['output'];
  usuario_modificacion?: Maybe<UsuarioResumen>;
  usuario_registro: UsuarioResumen;
};

export type Subscription = {
  __typename?: 'Subscription';
  /**  Recibir en tiempo real cuando se actualiza el estado de una orden  */
  ordenActualizada: Orden;
  /**  Recibir en tiempo real cuando se crea una nueva orden  */
  ordenNueva: Orden;
};

/** Resumen del usuario asignado a la orden (mesero) */
export type UsuarioResumen = {
  __typename?: 'UsuarioResumen';
  id_ct_usuario: Scalars['Int']['output'];
  nombre_completo: Scalars['String']['output'];
};
