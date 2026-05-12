import { Injectable, signal, computed } from '@angular/core';
import { Platillo } from '../../platillos/models/platillo.model';
import { ItemCarrito } from '../models/orden.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoStore {
  // Estado privado
  private readonly _items = signal<ItemCarrito[]>([]);
  private readonly _idMesa = signal<number | null>(null);

  // Selectores públicos
  readonly items = computed(() => this._items());
  readonly idMesa = computed(() => this._idMesa());
  readonly totalItems = computed(() => 
    this._items().reduce((acc, item) => acc + item.cantidad, 0)
  );
  readonly subtotal = computed(() =>
    this._items().reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  );
  readonly total = computed(() => this.subtotal());

  // Métodos de acción
  agregarPlatillo(platillo: Platillo) {
    this._items.update(items => {
      const index = items.findIndex(i => i.id === platillo.id);
      if (index >= 0) {
        return items.map((item, i) => 
          i === index ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...items, { ...platillo, cantidad: 1 }];
    });
  }

  quitarPlatillo(id: number) {
    this._items.update(items => items.filter(i => i.id !== id));
  }

  cambiarCantidad(id: number, delta: number) {
    this._items.update(items =>
      items.map(item => {
        if (item.id === id) {
          const nuevaCantidad = Math.max(1, item.cantidad + delta);
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      })
    );
  }

  setMesa(id: number | null | undefined) {
    this._idMesa.set(id ?? null);
  }

  limpiar() {
    this._items.set([]);
    this._idMesa.set(null);
  }
}
