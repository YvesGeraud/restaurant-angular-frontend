import { Component, EventEmitter, Output, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservacionBase } from '../../models/reservacion.model';

@Component({
  selector: 'app-reservacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card shadow-lg border-0" style="background-color: #1e1e1e;">
      <div class="card-body p-5">
        <h3 class="mb-4 text-center text-white" style="font-family: 'Playfair Display', serif;">Detalles de tu Reservación</h3>

        <div class="row g-3">
          <!-- TODO: En un flujo real público, capturaríamos Nombre y Correo para crear el cliente.
               Por ahora, usamos el cliente ID 1 por defecto para la demostración. -->
          
          <div class="col-md-6">
            <label class="form-label text-white-50">Fecha y Hora</label>
            <input type="datetime-local" class="form-control bg-dark text-white border-secondary" formControlName="fecha_reservacion" 
                   [class.is-invalid]="form.get('fecha_reservacion')?.invalid && form.get('fecha_reservacion')?.touched">
            <div class="invalid-feedback text-warning">Requerido. Recuerda que debe ser con 2 horas de anticipación.</div>
          </div>

          <div class="col-md-6">
            <label class="form-label text-white-50">Número de Personas</label>
            <input type="number" class="form-control bg-dark text-white border-secondary" formControlName="num_personas" min="1" max="20"
                   [class.is-invalid]="form.get('num_personas')?.invalid && form.get('num_personas')?.touched">
          </div>

          <div class="col-md-6">
            <label class="form-label text-white-50">Mesa Preferida</label>
            <select class="form-select bg-dark text-white border-secondary" formControlName="id_ct_mesa">
              <option [ngValue]="1">Mesa 1 (2 pax)</option>
              <option [ngValue]="2">Mesa 2 (4 pax)</option>
              <option [ngValue]="3">VIP (10 pax)</option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label text-white-50">Notas Especiales (Opcional)</label>
            <textarea class="form-control bg-dark text-white border-secondary" formControlName="notas" rows="2" placeholder="Ej: Aniversario, alergias..."></textarea>
          </div>
        </div>

        <button type="submit" class="btn w-100 mt-4 py-3 fw-bold rounded-pill shadow" style="background-color: #d4af37; color: #121212;" [disabled]="form.invalid || isSubmitting">
          <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2 text-dark"></span>
          Continuar al Pago
        </button>
      </div>
    </form>
  `
})
export class ReservacionFormComponent {
  @Output() formSubmit = new EventEmitter<ReservacionBase>();
  @Input() isSubmitting = false; // Manejado por el componente padre

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Hardcodeado para demo pública sin auth de cliente
      id_ct_cliente: [1], 
      id_ct_mesa: [1, Validators.required],
      num_personas: [2, [Validators.required, Validators.min(1)]],
      fecha_reservacion: ['', Validators.required],
      notas: ['']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const datos: ReservacionBase = {
        ...this.form.value,
        // Convertir datetime-local a formato ISO que espera el backend
        fecha_reservacion: new Date(this.form.value.fecha_reservacion).toISOString()
      };
      this.formSubmit.emit(datos);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
