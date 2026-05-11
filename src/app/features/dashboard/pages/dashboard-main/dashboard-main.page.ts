import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexFill,
  ApexTooltip,
  ApexPlotOptions,
  ApexGrid,
} from 'ng-apexcharts';

export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  labels: string[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
  fill: ApexFill;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  colors: string[];
  grid: ApexGrid;
}

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="container-fluid py-4 h-100 overflow-auto animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1 text-dark">Panel de Control</h2>
          <p class="text-muted">Resumen analítico de la operación del día de hoy</p>
        </div>
      </div>

      <!-- KPI Cards -->
      @if (stats(); as s) {
        <div class="row g-4 mb-4">
          <!-- Ventas Hoy -->
          <div class="col-md-4">
            <div
              class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 premium-card gradient-primary text-white"
            >
              <div class="card-body p-4 position-relative">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold text-white-50 tracking-wider mb-0">VENTAS DE HOY</h6>
                  <div
                    class="icon-box bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 48px; height: 48px;"
                  >
                    <i class="bi bi-currency-dollar fs-3"></i>
                  </div>
                </div>
                <h2 class="display-6 fw-bold mb-1">{{ s.ventasHoy | currency: 'USD' }}</h2>
                <div class="mt-3">
                  <span
                    class="badge bg-white text-primary rounded-pill px-3 py-2 fw-bold shadow-sm"
                  >
                    {{ s.ordenesHoy }} Órdenes generadas
                  </span>
                </div>
                <div class="circle-deco circle-1"></div>
                <div class="circle-deco circle-2"></div>
              </div>
            </div>
          </div>

          <!-- Ticket Promedio -->
          <div class="col-md-4">
            <div
              class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 premium-card gradient-info text-white"
            >
              <div class="card-body p-4 position-relative">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold text-white-50 tracking-wider mb-0">TICKET PROMEDIO</h6>
                  <div
                    class="icon-box bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 48px; height: 48px;"
                  >
                    <i class="bi bi-receipt fs-3"></i>
                  </div>
                </div>
                <h2 class="display-6 fw-bold mb-1">{{ s.ticketPromedioHoy | currency: 'USD' }}</h2>
                <p class="mb-0 text-white-50 mt-3 small">
                  Promedio de consumo por orden el día de hoy
                </p>
                <div class="circle-deco circle-1"></div>
                <div class="circle-deco circle-2"></div>
              </div>
            </div>
          </div>

          <!-- Ocupación -->
          <div class="col-md-4">
            <div
              class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 premium-card gradient-warning text-white"
            >
              <div class="card-body p-4 position-relative">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold text-white-50 tracking-wider mb-0">OCUPACIÓN DE MESAS</h6>
                  <div
                    class="icon-box bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 48px; height: 48px;"
                  >
                    <i class="bi bi-grid-3x3-gap fs-3"></i>
                  </div>
                </div>
                <div class="d-flex align-items-baseline gap-2 mb-1">
                  <h2 class="display-6 fw-bold mb-0">{{ s.ocupacionMesas.porcentaje }}%</h2>
                  <span class="fs-5 text-white-50"
                    >({{ s.ocupacionMesas.ocupadas }}/{{ s.ocupacionMesas.total }})</span
                  >
                </div>

                <div
                  class="progress mt-3 bg-white bg-opacity-25"
                  style="height: 8px; border-radius: 4px;"
                >
                  <div
                    class="progress-bar bg-white transition-all"
                    role="progressbar"
                    [style.width.%]="s.ocupacionMesas.porcentaje"
                    [attr.aria-valuenow]="s.ocupacionMesas.porcentaje"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <div class="circle-deco circle-1"></div>
                <div class="circle-deco circle-2"></div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Charts Row -->
      <div class="row g-4 mb-4">
        <!-- Main Chart: Ventas 7 días -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark mb-4">Tendencia de Ventas (Últimos 7 Días)</h5>
              <div id="chart">
                @if (chartOptions) {
                  <apx-chart
                    [series]="chartOptions.series!"
                    [chart]="chartOptions.chart!"
                    [xaxis]="chartOptions.xaxis!"
                    [stroke]="chartOptions.stroke!"
                    [colors]="chartOptions.colors!"
                    [dataLabels]="chartOptions.dataLabels!"
                    [fill]="chartOptions.fill!"
                    [yaxis]="chartOptions.yaxis!"
                    [grid]="chartOptions.grid!"
                    [tooltip]="chartOptions.tooltip!"
                  ></apx-chart>
                } @else {
                  <div
                    class="d-flex justify-content-center align-items-center"
                    style="height: 350px;"
                  >
                    <div class="spinner-border text-primary" role="status"></div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Side Chart: Top 5 Platillos -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark mb-4">Top 5 Platillos más Vendidos</h5>
              <div id="bar-chart">
                @if (barChartOptions) {
                  <apx-chart
                    [series]="barChartOptions.series!"
                    [chart]="barChartOptions.chart!"
                    [xaxis]="barChartOptions.xaxis!"
                    [plotOptions]="barChartOptions.plotOptions!"
                    [dataLabels]="barChartOptions.dataLabels!"
                    [colors]="barChartOptions.colors!"
                    [grid]="barChartOptions.grid!"
                    [tooltip]="barChartOptions.tooltip!"
                  ></apx-chart>
                } @else {
                  <div
                    class="d-flex justify-content-center align-items-center"
                    style="height: 350px;"
                  >
                    <div class="spinner-border text-primary" role="status"></div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .premium-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        z-index: 1;
      }
      .premium-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.2) !important;
      }
      .gradient-primary {
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      }
      .gradient-info {
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
      }
      .gradient-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      }
      .tracking-wider {
        letter-spacing: 0.08em;
      }
      .circle-deco {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.12);
        z-index: -1;
      }
      .circle-1 {
        width: 160px;
        height: 160px;
        top: -40px;
        right: -40px;
      }
      .circle-2 {
        width: 110px;
        height: 110px;
        bottom: -25px;
        right: 55px;
      }
      .animate-fade-in {
        animation: fadeIn 0.6s ease-out;
      }
      .transition-all {
        transition: all 0.5s ease;
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
export class DashboardMainPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> | null = null;
  public barChartOptions: Partial<ChartOptions> | null = null;

  ngOnInit() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.initCharts(data);
      },
      error: (err) => console.error('Error cargando stats del dashboard', err),
    });
  }

  private initCharts(data: DashboardStats) {
    const fechas = data.ventasUltimos7Dias.map((v) => {
      const parts = v.fecha.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    });

    const totales = data.ventasUltimos7Dias.map((v) => v.total);

    this.chartOptions = {
      series: [{ name: 'Ventas', data: totales }],
      chart: {
        height: 350,
        type: 'area',
        fontFamily: "'Outfit', sans-serif",
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ['#4f46e5'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      xaxis: {
        categories: fechas,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#64748b', fontSize: '12px' } },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => '$' + value.toLocaleString(),
          style: { colors: '#64748b' },
        },
      },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      tooltip: { theme: 'light', x: { show: true } },
    };

    const topNombres = data.top5Platillos.map((p) => p.nombre);
    const topCantidades = data.top5Platillos.map((p) => p.cantidad);

    this.barChartOptions = {
      series: [{ name: 'Unidades', data: topCantidades }],
      chart: {
        type: 'bar',
        height: 350,
        fontFamily: "'Outfit', sans-serif",
        toolbar: { show: false },
      },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 6, dataLabels: { position: 'top' } },
      },
      colors: ['#0ea5e9'],
      dataLabels: {
        enabled: true,
        offsetX: -6,
        style: { fontSize: '12px', colors: ['#fff'] },
      },
      xaxis: {
        categories: topNombres,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: '#475569', fontWeight: 600 } },
      },
      grid: { show: false },
      tooltip: { theme: 'dark' },
    };
  }
}
