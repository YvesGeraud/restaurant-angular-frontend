import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Orden } from '../../ordenes/models/orden.model';

const ORDEN_NUEVA_SUBSCRIPTION = gql`
  subscription OrdenNueva {
    ordenNueva {
      id_rl_orden
      estado
      total
      fecha_reg
      id_ct_usuario_reg
      mesa {
        id_ct_mesa
        codigo
      }
      usuario {
        id_ct_usuario
        nombre_completo
      }
      detalles {
        id_dt_detalle_orden
        cantidad
        precio_unitario
        subtotal
        platillo {
          id_ct_platillo
          nombre
        }
      }
    }
  }
`;

const ORDEN_ACTUALIZADA_SUBSCRIPTION = gql`
  subscription OrdenActualizada {
    ordenActualizada {
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
      }
      usuario {
        id_ct_usuario
        nombre_completo
      }
      detalles {
        id_dt_detalle_orden
        cantidad
        precio_unitario
        subtotal
        platillo {
          id_ct_platillo
          nombre
        }
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class OrdenSubscriptionService {
  private readonly apollo = inject(Apollo);

  ordenNueva$(): Observable<Orden> {
    return this.apollo
      .subscribe<{ ordenNueva: Orden }>({ query: ORDEN_NUEVA_SUBSCRIPTION })
      .pipe(
        map((result) => result.data?.ordenNueva),
        filter((orden): orden is Orden => orden !== null && orden !== undefined),
      );
  }

  ordenActualizada$(): Observable<Orden> {
    return this.apollo
      .subscribe<{ ordenActualizada: Orden }>({ query: ORDEN_ACTUALIZADA_SUBSCRIPTION })
      .pipe(
        map((result) => result.data?.ordenActualizada),
        filter((orden): orden is Orden => orden !== null && orden !== undefined),
      );
  }
}
