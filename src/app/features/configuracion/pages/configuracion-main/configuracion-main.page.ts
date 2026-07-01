import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ConfiguracionService } from '../../services/configuracion.service';
import { Configuracion } from '../../models/configuracion.model';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-configuracion-main',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4 animate-fade-in" style="max-width: 760px">
      <!-- Header -->
      <div class="mb-4">
        <h2 class="mb-1 fw-bold text-dark">Configuración</h2>
        <p class="text-muted">Ajusta los datos generales de tu restaurante</p>
      </div>

      @if (cargando()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p class="text-muted">Cargando configuración...</p>
        </div>
      } @else {
        <form #form="ngForm" (ngSubmit)="guardar(form.valid)">

          <!-- Card: Identidad -->
          <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h6 class="fw-bold text-uppercase text-muted small tracking-wider mb-0">
                <i class="bi bi-shop me-2"></i>Identidad del restaurante
              </h6>
            </div>
            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold small">Nombre del restaurante</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    name="nombre_restaurante"
                    [(ngModel)]="config.nombre_restaurante"
                    maxlength="100"
                    placeholder="Mi Restaurante"
                    #nombreCtrl="ngModel"
                    [class.is-invalid]="nombreCtrl.invalid && nombreCtrl.touched"
                  />
                  <div class="invalid-feedback">El nombre es obligatorio</div>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold small">URL del logo</label>
                  <input
                    type="url"
                    class="form-control rounded-3"
                    name="logo_url"
                    [(ngModel)]="config.logo_url"
                    maxlength="500"
                    placeholder="https://..."
                  />
                  @if (config.logo_url) {
                    <div class="mt-2">
                      <img
                        [src]="config.logo_url"
                        alt="Logo"
                        class="rounded-3 border"
                        style="max-height: 80px; object-fit: contain"
                        (error)="config.logo_url = null"
                      />
                    </div>
                  }
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Teléfono de contacto</label>
                  <input
                    type="tel"
                    class="form-control rounded-3"
                    name="telefono"
                    [(ngModel)]="config.telefono"
                    maxlength="20"
                    placeholder="+52 555 000 0000"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Email de contacto</label>
                  <input
                    type="email"
                    class="form-control rounded-3"
                    name="email_contacto"
                    [(ngModel)]="config.email_contacto"
                    maxlength="255"
                    placeholder="contacto@restaurante.com"
                  />
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold small">Dirección</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    name="direccion"
                    [(ngModel)]="config.direccion"
                    maxlength="255"
                    placeholder="Calle, número, colonia, ciudad"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Horarios -->
          <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h6 class="fw-bold text-uppercase text-muted small tracking-wider mb-0">
                <i class="bi bi-clock me-2"></i>Horarios de operación
              </h6>
            </div>
            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Hora de apertura</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    name="horario_apertura"
                    [(ngModel)]="config.horario_apertura"
                    maxlength="50"
                    placeholder="10:00"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Hora de cierre</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    name="horario_cierre"
                    [(ngModel)]="config.horario_cierre"
                    maxlength="50"
                    placeholder="23:00"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Finanzas -->
          <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h6 class="fw-bold text-uppercase text-muted small tracking-wider mb-0">
                <i class="bi bi-cash-coin me-2"></i>Configuración financiera
              </h6>
            </div>
            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Símbolo de moneda</label>
                  <input
                    type="text"
                    class="form-control rounded-3"
                    name="moneda"
                    [(ngModel)]="config.moneda"
                    maxlength="10"
                    placeholder="$"
                  />
                </div>
                <div class="col-md-8">
                  <label class="form-label fw-semibold small">
                    Impuesto (porcentaje decimal, ej: 0.16 = 16%)
                  </label>
                  <div class="input-group">
                    <input
                      type="number"
                      class="form-control rounded-start-3"
                      name="impuesto_porcentaje"
                      [(ngModel)]="config.impuesto_porcentaje"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span class="input-group-text rounded-end-3 bg-light text-muted">
                      = {{ (config.impuesto_porcentaje ?? 0) * 100 | number: '1.0-0' }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón guardar -->
          <div class="d-flex justify-content-end gap-2">
            <button
              type="submit"
              class="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
              [disabled]="guardando()"
            >
              @if (guardando()) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              } @else {
                <i class="bi bi-floppy me-2"></i>
              }
              Guardar cambios
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    :host { display: block; background: #f8f9fa; min-height: 100vh; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .tracking-wider { letter-spacing: 0.05em; }
  `],
})
export class ConfiguracionMainPage implements OnInit {
  private readonly configuracionService = inject(ConfiguracionService);
  private readonly notifications = inject(NotificationService);

  cargando = signal(false);
  guardando = signal(false);

  config: Configuracion = {
    nombre_restaurante: '',
    logo_url: null,
    telefono: null,
    direccion: null,
    email_contacto: null,
    horario_apertura: null,
    horario_cierre: null,
    moneda: '$',
    impuesto_porcentaje: 0.16,
  };

  ngOnInit() {
    this.cargando.set(true);
    this.configuracionService
      .obtener()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (res) => Object.assign(this.config, res.datos),
        error: () => this.notifications.error('No se pudo cargar la configuración'),
      });
  }

  guardar(valid: boolean | null) {
    if (!valid) return;
    this.guardando.set(true);

    const payload = {
      nombre_restaurante: this.config.nombre_restaurante,
      logo_url: this.config.logo_url,
      telefono: this.config.telefono,
      direccion: this.config.direccion,
      email_contacto: this.config.email_contacto,
      horario_apertura: this.config.horario_apertura,
      horario_cierre: this.config.horario_cierre,
      moneda: this.config.moneda,
      impuesto_porcentaje: this.config.impuesto_porcentaje,
    };

    this.configuracionService
      .actualizar(payload)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (res) => {
          Object.assign(this.config, res.datos);
          this.notifications.success('Configuración guardada correctamente');
        },
        error: () => this.notifications.error('Error al guardar la configuración'),
      });
  }
}
