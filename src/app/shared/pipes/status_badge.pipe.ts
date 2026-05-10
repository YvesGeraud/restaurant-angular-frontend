import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  /**
   * Mapea un estado booleano a una clase de badge de Bootstrap.
   * Uso: <span class="badge" [ngClass]="item.estado | statusBadge">
   */
  transform(value: boolean | string | undefined | null): string {
    // Manejo de booleanos (Platillos, etc.)
    if (value === true) return 'bg-success-subtle text-success border border-success';
    if (value === false) return 'bg-secondary-subtle text-secondary border border-secondary';

    // Manejo de estados de Mesas
    if (typeof value === 'string') {
      const status = value.toLowerCase();
      switch (status) {
        case 'libre': return 'bg-success-subtle text-success border border-success';
        case 'ocupada': return 'bg-danger-subtle text-danger border border-danger';
        case 'reservada': return 'bg-warning-subtle text-warning border border-warning';
        case 'inactiva': return 'bg-secondary-subtle text-secondary border border-secondary';
        default: return 'bg-secondary-subtle text-secondary border border-secondary';
      }
    }

    return 'bg-secondary-subtle text-secondary border border-secondary';
  }
}
