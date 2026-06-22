/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '../generated/graphql-types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type ActualizarEstadoOrdenInput = {
  estado: EstadoOrden;
};

export type CrearOrdenInput = {
  detalles: Array<ItemOrdenInput>;
  /**  ID de mesa (null si es orden para llevar)  */
  id_mesa?: number | null | undefined;
};

/** Estado posible de una orden (espejo del enum Prisma rl_orden_estado) */
export type EstadoOrden =
  | 'CANCELADO'
  | 'ENTREGADO'
  | 'EN_PROCESO'
  | 'LISTO'
  | 'PAGADA'
  | 'PENDIENTE';

export type FiltrosOrdenesInput = {
  estado?: EstadoOrden | null | undefined;
  id_ct_usuario?: number | null | undefined;
  id_mesa?: number | null | undefined;
  limite?: number | null | undefined;
  pagina?: number | null | undefined;
};

export type ItemOrdenInput = {
  cantidad: number;
  id_ct_platillo: number;
};

export type DetalleOrdenFragmentFragment = { id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } };

export type OrdenCompletaFragmentFragment = { id_rl_orden: number, estado: Types.EstadoOrden, total: unknown, fecha_reg: unknown, fecha_mod: unknown, id_ct_usuario_reg: number, id_ct_usuario_mod: number | null, mesa: { id_ct_mesa: number, codigo: string, capacidad: number, status: string, estado: boolean } | null, usuario: { id_ct_usuario: number, nombre_completo: string }, detalles: Array<{ id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } }> };

export type GetOrdenesQueryVariables = Exact<{
  filtros?: Types.FiltrosOrdenesInput | null | undefined;
}>;


export type GetOrdenesQuery = { ordenes: Array<{ id_rl_orden: number, estado: Types.EstadoOrden, total: unknown, fecha_reg: unknown, fecha_mod: unknown, id_ct_usuario_reg: number, id_ct_usuario_mod: number | null, mesa: { id_ct_mesa: number, codigo: string, capacidad: number, status: string, estado: boolean } | null, usuario: { id_ct_usuario: number, nombre_completo: string }, detalles: Array<{ id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } }> }> };

export type GetOrdenQueryVariables = Exact<{
  id: number;
}>;


export type GetOrdenQuery = { orden: { id_rl_orden: number, estado: Types.EstadoOrden, total: unknown, fecha_reg: unknown, fecha_mod: unknown, id_ct_usuario_reg: number, id_ct_usuario_mod: number | null, mesa: { id_ct_mesa: number, codigo: string, capacidad: number, status: string, estado: boolean } | null, usuario: { id_ct_usuario: number, nombre_completo: string }, detalles: Array<{ id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } }> } | null };

export type CrearOrdenMutationVariables = Exact<{
  input: Types.CrearOrdenInput;
}>;


export type CrearOrdenMutation = { crearOrden: { id_rl_orden: number, estado: Types.EstadoOrden, total: unknown, fecha_reg: unknown, fecha_mod: unknown, id_ct_usuario_reg: number, id_ct_usuario_mod: number | null, mesa: { id_ct_mesa: number, codigo: string, capacidad: number, status: string, estado: boolean } | null, usuario: { id_ct_usuario: number, nombre_completo: string }, detalles: Array<{ id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } }> } };

export type CambiarEstadoOrdenMutationVariables = Exact<{
  id: number;
  input: Types.ActualizarEstadoOrdenInput;
}>;


export type CambiarEstadoOrdenMutation = { cambiarEstadoOrden: { id_rl_orden: number, estado: Types.EstadoOrden, total: unknown, fecha_reg: unknown, fecha_mod: unknown, id_ct_usuario_reg: number, id_ct_usuario_mod: number | null, mesa: { id_ct_mesa: number, codigo: string, capacidad: number, status: string, estado: boolean } | null, usuario: { id_ct_usuario: number, nombre_completo: string }, detalles: Array<{ id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } }> } };

export type CancelarOrdenMutationVariables = Exact<{
  id: number;
}>;


export type CancelarOrdenMutation = { cancelarOrden: { id_rl_orden: number, estado: Types.EstadoOrden, total: unknown, fecha_reg: unknown, fecha_mod: unknown, id_ct_usuario_reg: number, id_ct_usuario_mod: number | null, mesa: { id_ct_mesa: number, codigo: string, capacidad: number, status: string, estado: boolean } | null, usuario: { id_ct_usuario: number, nombre_completo: string }, detalles: Array<{ id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } }> } };

export type OnOrdenNuevaSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnOrdenNuevaSubscription = { ordenNueva: { id_rl_orden: number, estado: Types.EstadoOrden, total: unknown, fecha_reg: unknown, fecha_mod: unknown, id_ct_usuario_reg: number, id_ct_usuario_mod: number | null, mesa: { id_ct_mesa: number, codigo: string, capacidad: number, status: string, estado: boolean } | null, usuario: { id_ct_usuario: number, nombre_completo: string }, detalles: Array<{ id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } }> } };

export type OnOrdenActualizadaSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnOrdenActualizadaSubscription = { ordenActualizada: { id_rl_orden: number, estado: Types.EstadoOrden, total: unknown, fecha_reg: unknown, fecha_mod: unknown, id_ct_usuario_reg: number, id_ct_usuario_mod: number | null, mesa: { id_ct_mesa: number, codigo: string, capacidad: number, status: string, estado: boolean } | null, usuario: { id_ct_usuario: number, nombre_completo: string }, detalles: Array<{ id_dt_detalle_orden: number, cantidad: number, precio_unitario: unknown, subtotal: unknown, platillo: { id_ct_platillo: number, nombre: string, precio: unknown, imagen_url: string | null } }> } };

export const DetalleOrdenFragmentFragmentDoc = gql`
    fragment DetalleOrdenFragment on DetalleOrden {
  id_dt_detalle_orden
  cantidad
  precio_unitario
  subtotal
  platillo {
    id_ct_platillo
    nombre
    precio
    imagen_url
  }
}
    `;
export const OrdenCompletaFragmentFragmentDoc = gql`
    fragment OrdenCompletaFragment on Orden {
  id_rl_orden
  estado
  total
  fecha_reg
  fecha_mod
  id_ct_usuario_reg
  id_ct_usuario_mod
  mesa {
    id_ct_mesa
    codigo
    capacidad
    status
    estado
  }
  usuario {
    id_ct_usuario
    nombre_completo
  }
  detalles {
    ...DetalleOrdenFragment
  }
}
    ${DetalleOrdenFragmentFragmentDoc}`;
export const GetOrdenesDocument = gql`
    query GetOrdenes($filtros: FiltrosOrdenesInput) {
  ordenes(filtros: $filtros) {
    ...OrdenCompletaFragment
  }
}
    ${OrdenCompletaFragmentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetOrdenesGQL extends Apollo.Query<GetOrdenesQuery, GetOrdenesQueryVariables> {
    override document = GetOrdenesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetOrdenDocument = gql`
    query GetOrden($id: Int!) {
  orden(id: $id) {
    ...OrdenCompletaFragment
  }
}
    ${OrdenCompletaFragmentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetOrdenGQL extends Apollo.Query<GetOrdenQuery, GetOrdenQueryVariables> {
    override document = GetOrdenDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CrearOrdenDocument = gql`
    mutation CrearOrden($input: CrearOrdenInput!) {
  crearOrden(input: $input) {
    ...OrdenCompletaFragment
  }
}
    ${OrdenCompletaFragmentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CrearOrdenGQL extends Apollo.Mutation<CrearOrdenMutation, CrearOrdenMutationVariables> {
    override document = CrearOrdenDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CambiarEstadoOrdenDocument = gql`
    mutation CambiarEstadoOrden($id: Int!, $input: ActualizarEstadoOrdenInput!) {
  cambiarEstadoOrden(id: $id, input: $input) {
    ...OrdenCompletaFragment
  }
}
    ${OrdenCompletaFragmentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CambiarEstadoOrdenGQL extends Apollo.Mutation<CambiarEstadoOrdenMutation, CambiarEstadoOrdenMutationVariables> {
    override document = CambiarEstadoOrdenDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CancelarOrdenDocument = gql`
    mutation CancelarOrden($id: Int!) {
  cancelarOrden(id: $id) {
    ...OrdenCompletaFragment
  }
}
    ${OrdenCompletaFragmentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CancelarOrdenGQL extends Apollo.Mutation<CancelarOrdenMutation, CancelarOrdenMutationVariables> {
    override document = CancelarOrdenDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const OnOrdenNuevaDocument = gql`
    subscription OnOrdenNueva {
  ordenNueva {
    ...OrdenCompletaFragment
  }
}
    ${OrdenCompletaFragmentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class OnOrdenNuevaGQL extends Apollo.Subscription<OnOrdenNuevaSubscription, OnOrdenNuevaSubscriptionVariables> {
    override document = OnOrdenNuevaDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const OnOrdenActualizadaDocument = gql`
    subscription OnOrdenActualizada {
  ordenActualizada {
    ...OrdenCompletaFragment
  }
}
    ${OrdenCompletaFragmentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class OnOrdenActualizadaGQL extends Apollo.Subscription<OnOrdenActualizadaSubscription, OnOrdenActualizadaSubscriptionVariables> {
    override document = OnOrdenActualizadaDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }