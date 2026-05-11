import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservacionBase } from '../../models/reservacion.model';

@Component({
  selector: 'app-reservacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="card shadow-lg border-0 animate-slide-up"
      style="background-color: #1e1e1e; border-radius: 1.5rem;"
    >
      <div class="card-body p-4 p-md-5">
        <h3
          class="mb-4 text-center text-white fw-bold"
          style="font-family: 'Playfair Display', serif; color: #d4af37;"
        >
          Detalles de tu Reservación
        </h3>

        <div class="row g-4">
          <div class="col-md-6">
            <label for="rf_fecha" class="form-label text-white-50 small fw-bold text-uppercase"
              >Fecha y Hora</label
            >
            <input
              id="rf_fecha"
              type="datetime-local"
              class="form-control bg-dark text-white border-secondary py-2 shadow-none"
              formControlName="fecha_reservacion"
              [class.is-invalid]="
                form.get('fecha_reservacion')?.invalid && form.get('fecha_reservacion')?.touched
              "
            />
            <div class="invalid-feedback text-warning">
              Requerido. Recuerda que debe ser con 2 horas de anticipación.
            </div>
          </div>

          <div class="col-md-6">
            <label for="rf_personas" class="form-label text-white-50 small fw-bold text-uppercase"
              >Número de Personas</label
            >
            <input
              id="rf_personas"
              type="number"
              class="form-control bg-dark text-white border-secondary py-2 shadow-none"
              formControlName="num_personas"
              min="1"
              max="20"
              [class.is-invalid]="
                form.get('num_personas')?.invalid && form.get('num_personas')?.touched
              "
            />
          </div>

          <div class="col-md-12">
            <label for="rf_mesa" class="form-label text-white-50 small fw-bold text-uppercase"
              >Mesa Preferida</label
            >
            <select
              id="rf_mesa"
              class="form-select bg-dark text-white border-secondary py-2 shadow-none"
              formControlName="id_ct_mesa"
            >
              <option [ngValue]="1">Mesa 1 (2 pax)</option>
              <option [ngValue]="2">Mesa 2 (4 pax)</option>
              <option [ngValue]="3">VIP (10 pax)</option>
            </select>
          </div>

          <div class="col-12">
            <label for="rf_notas" class="form-label text-white-50 small fw-bold text-uppercase"
              >Notas Especiales (Opcional)</label
            >
            <textarea
              id="rf_notas"
              class="form-control bg-dark text-white border-secondary shadow-none"
              formControlName="notas"
              rows="3"
              placeholder="Ej: Aniversario, alergias, requerimientos especiales..."
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          class="btn w-100 mt-5 py-3 fw-bold rounded-pill shadow-lg transition-all"
          style="background-color: #d4af37; color: #121212;"
          [disabled]="form.invalid || isSubmitting"
        >
          @if (isSubmitting) {
            <span
              class="spinner-border spinner-border-sm me-2 text-dark"
              role="status"
              aria-hidden="true"
            ></span>
            <span>Validando...</span>
          } @else {
            <span>Continuar al Pago Seguro</span>
          }
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .transition-all {
        transition: all 0.3s ease;
      }
      .transition-all:hover:not(:disabled) {
        transform: translateY(-2px);
        filter: brightness(1.1);
      }
      .animate-slide-up {
        animation: slideUp 0.5s ease-out;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ReservacionFormComponent {
  private readonly fb = inject(FormBuilder);

  @Output() formSubmit = new EventEmitter<ReservacionBase>();
  @Input() isSubmitting = false;

  form: FormGroup = this.fb.group({
    id_ct_cliente: [1],
    id_ct_mesa: [1, Validators.required],
    num_personas: [2, [Validators.required, Validators.min(1)]],
    fecha_reservacion: ['', Validators.required],
    notas: [''],
  });

  onSubmit() {
    if (this.form.valid) {
      const datos: ReservacionBase = {
        ...this.form.value,
        fecha_reservacion: new Date(this.form.value.fecha_reservacion).toISOString(),
      };
      this.formSubmit.emit(datos);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
