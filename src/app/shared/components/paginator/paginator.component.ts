import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  /** Cantidad total de páginas */
  readonly total = input.required<number>();

  /** Página actual (1-indexed) */
  readonly current = input.required<number>();

  /** Emisión de cambio de página */
  readonly pageChange = output<number>();

  /** Generar el array de páginas a mostrar */
  readonly pages = computed(() => {
    const total = this.total();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  onPageClick(page: number): void {
    if (page !== this.current()) {
      this.pageChange.emit(page);
    }
  }

  onPrev(): void {
    if (this.current() > 1) {
      this.pageChange.emit(this.current() - 1);
    }
  }

  onNext(): void {
    if (this.current() < this.total()) {
      this.pageChange.emit(this.current() + 1);
    }
  }
}
