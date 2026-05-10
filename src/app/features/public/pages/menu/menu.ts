import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatillosService } from '../../../platillos/services/platillos.service';
import { Platillo } from '../../../platillos/models/platillo.model';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  providers: [PlatillosService],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class MenuComponent implements OnInit {
  private readonly platillosService = inject(PlatillosService);

  readonly platillos = signal<Platillo[]>([]);
  readonly categorias = signal<string[]>([]);
  readonly categoriaSeleccionada = signal<string>('Todos');
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly platillosFiltrados = computed(() => {
    const selected = this.categoriaSeleccionada();
    const all = this.platillos();
    if (selected === 'Todos') return all;
    return all.filter(p => p.categoria.nombre === selected);
  });

  ngOnInit() {
    this.cargarPlatillos();
  }

  cargarPlatillos() {
    this.loading.set(true);
    this.error.set(null);
    this.platillosService.getPlatillos({ limite: 100 }).subscribe({
      next: (res) => {
        try {
          const filtrados = res.datos.filter(p => p.estado);
          this.platillos.set(filtrados);
          this.extraerCategorias(filtrados);
        } catch (e) {
          console.error('Error al procesar datos:', e);
        } finally {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error HTTP o de mapping al cargar menú:', err);
        this.error.set('No pudimos cargar el menú en este momento.');
        this.loading.set(false);
      }
    });
  }

  private extraerCategorias(datos: Platillo[]) {
    const cats = new Set(datos.map(p => p.categoria.nombre));
    this.categorias.set(['Todos', ...Array.from(cats)]);
  }

  setCategoria(cat: string) {
    this.categoriaSeleccionada.set(cat);
  }
}
