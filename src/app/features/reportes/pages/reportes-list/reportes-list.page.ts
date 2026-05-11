import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService, EstadisticasVentas } from '../../services/reportes.service';

@Component({
  selector: 'app-reportes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4 animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1 text-dark">Análisis y Reportes</h2>
          <p class="text-muted">Monitoreo de métricas clave y exportación de datos</p>
        </div>
      </div>

      <!-- Resumen Cards -->
      <div class="row g-4 mb-5">
        <div class="col-md-3">
          <div
            class="card border-0 shadow-sm rounded-4 p-4 premium-stat-card bg-primary text-white h-100"
          >
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="rounded-circle bg-white bg-opacity-25 p-2">
                <i class="bi bi-cash-coin fs-4"></i>
              </div>
            </div>
            <h6 class="text-white text-opacity-75 small fw-bold tracking-wider">VENTAS TOTALES</h6>
            <h2 class="fw-bold mb-0">{{ totalVentas() | currency: 'USD' }}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div
            class="card border-0 shadow-sm rounded-4 p-4 premium-stat-card bg-success text-white h-100"
          >
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="rounded-circle bg-white bg-opacity-25 p-2">
                <i class="bi bi-cart-check fs-4"></i>
              </div>
            </div>
            <h6 class="text-white text-opacity-75 small fw-bold tracking-wider">
              ÓRDENES COMPLETADAS
            </h6>
            <h2 class="fw-bold mb-0">{{ totalOrdenes() }}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div
            class="card border-0 shadow-sm rounded-4 p-4 premium-stat-card bg-info text-white h-100"
          >
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="rounded-circle bg-white bg-opacity-25 p-2">
                <i class="bi bi-people fs-4"></i>
              </div>
            </div>
            <h6 class="text-white text-opacity-75 small fw-bold tracking-wider">TICKET PROMEDIO</h6>
            <h2 class="fw-bold mb-0">{{ ticketPromedio() | currency: 'USD' }}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div
            class="card border-0 shadow-sm rounded-4 p-4 premium-stat-card bg-warning text-white h-100"
          >
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="rounded-circle bg-white bg-opacity-25 p-2">
                <i class="bi bi-star fs-4"></i>
              </div>
            </div>
            <h6 class="text-white text-opacity-75 small fw-bold tracking-wider">
              PRODUCTO ESTRELLA
            </h6>
            <h2 class="fw-bold mb-0 text-truncate" [title]="stats().platilloFavorito">
              {{ stats().platilloFavorito }}
            </h2>
          </div>
        </div>
      </div>

      <!-- Filtros y Exportación -->
      <div class="card border-0 shadow-sm rounded-4 p-4 bg-white overflow-hidden position-relative">
        <h5 class="fw-bold mb-4 text-dark">
          <i class="bi bi-funnel me-2"></i>Herramientas de Exportación
        </h5>
        <div class="row g-4 align-items-end position-relative" style="z-index: 1;">
          <div class="col-md-4">
            <label for="rep_inicio" class="form-label small fw-bold text-muted text-uppercase"
              >Desde el día</label
            >
            <input
              id="rep_inicio"
              type="date"
              class="form-control border-0 bg-light py-3 rounded-3 shadow-none fw-semibold"
              [(ngModel)]="fechaInicio"
              (change)="cargarEstadisticas()"
            />
          </div>
          <div class="col-md-4">
            <label for="rep_fin" class="form-label small fw-bold text-muted text-uppercase"
              >Hasta el día</label
            >
            <input
              id="rep_fin"
              type="date"
              class="form-control border-0 bg-light py-3 rounded-3 shadow-none fw-semibold"
              [(ngModel)]="fechaFin"
              (change)="cargarEstadisticas()"
            />
          </div>
          <div class="col-md-4">
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-outline-success border-2 fw-bold flex-grow-1 py-3 rounded-3 transition-all"
                (click)="exportarExcel()"
              >
                <i class="bi bi-file-earmark-excel me-2"></i> EXCEL
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-2 fw-bold flex-grow-1 py-3 rounded-3 transition-all"
                (click)="exportarPdf()"
              >
                <i class="bi bi-file-earmark-pdf me-2"></i> PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .premium-stat-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .premium-stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.15) !important;
      }
      .tracking-wider {
        letter-spacing: 0.05em;
      }
      .transition-all {
        transition: all 0.2s ease;
      }
      .transition-all:hover {
        filter: brightness(1.05);
      }
      .animate-fade-in {
        animation: fadeIn 0.4s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(15px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ReportesListPage implements OnInit {
  private readonly reportesService = inject(ReportesService);

  fechaInicio = '';
  fechaFin = '';
  stats = signal<EstadisticasVentas>({
    totalVentas: 0,
    totalOrdenes: 0,
    ticketPromedio: 0,
    platilloFavorito: 'Cargando...',
  });

  totalVentas = computed(() => this.stats().totalVentas);
  totalOrdenes = computed(() => this.stats().totalOrdenes);
  ticketPromedio = computed(() => this.stats().ticketPromedio);

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.reportesService.getEstadisticas(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => this.stats.set(data),
      error: () => {
        this.stats.update((s) => ({ ...s, platilloFavorito: 'N/A' }));
      },
    });
  }

  exportarExcel() {
    this.reportesService.descargarExcelVentas(this.fechaInicio, this.fechaFin);
  }

  exportarPdf() {
    this.reportesService.descargarPdfVentas(this.fechaInicio, this.fechaFin);
  }
}
