import { Component, EventEmitter, Output, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservacionBase } from '../../models/reservacion.model';
import { MesasService } from '@features/mesas/services/mesas.service';
import { Mesa } from '@features/mesas/models/mesa.model';

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

        <!-- Datos del Cliente (Grupo Anidado) -->
        <div formGroupName="cliente" class="row g-4 mb-4">
          <div class="col-12">
            <h5
              class="text-white-50 small fw-bold text-uppercase border-bottom border-secondary pb-2 mb-1"
              style="letter-spacing: 0.1rem; color: #d4af37 !important;"
            >
              Datos de Contacto
            </h5>
          </div>

          <div class="col-12">
            <label for="rf_nombre" class="form-label text-white-50 small fw-bold text-uppercase"
              >Nombre Completo</label
            >
            <input
              id="rf_nombre"
              type="text"
              class="form-control bg-dark text-white border-secondary py-2 shadow-none"
              formControlName="nombre"
              [class.is-invalid]="
                form.get('cliente.nombre')?.invalid && form.get('cliente.nombre')?.touched
              "
              placeholder="Ingresa tu nombre y apellido"
            />
            <div class="invalid-feedback text-warning">
              El nombre es requerido (mínimo 3 caracteres).
            </div>
          </div>

          <div class="col-md-6">
            <label for="rf_correo" class="form-label text-white-50 small fw-bold text-uppercase"
              >Correo Electrónico</label
            >
            <input
              id="rf_correo"
              type="email"
              class="form-control bg-dark text-white border-secondary py-2 shadow-none"
              formControlName="correo"
              [class.is-invalid]="
                form.get('cliente.correo')?.invalid && form.get('cliente.correo')?.touched
              "
              placeholder="correo@ejemplo.com"
            />
            <div class="invalid-feedback text-warning">
              Ingresa un correo electrónico válido.
            </div>
          </div>

          <div class="col-md-6">
            <label for="rf_telefono" class="form-label text-white-50 small fw-bold text-uppercase"
              >Teléfono de Contacto</label
            >
            <input
              id="rf_telefono"
              type="tel"
              class="form-control bg-dark text-white border-secondary py-2 shadow-none"
              formControlName="telefono"
              [class.is-invalid]="
                form.get('cliente.telefono')?.invalid && form.get('cliente.telefono')?.touched
              "
              placeholder="Ej: 5512345678"
            />
            <div class="invalid-feedback text-warning">
              Ingresa un teléfono válido (de 8 a 20 dígitos).
            </div>
          </div>
        </div>

        <!-- Datos de Reservación -->
        <div class="row g-4">
          <div class="col-12 mt-4">
            <h5
              class="text-white-50 small fw-bold text-uppercase border-bottom border-secondary pb-2 mb-1"
              style="letter-spacing: 0.1rem; color: #d4af37 !important;"
            >
              Detalles Logísticos
            </h5>
          </div>

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
              max="50"
              [class.is-invalid]="
                form.get('num_personas')?.invalid && form.get('num_personas')?.touched
              "
            />
            <div class="invalid-feedback text-warning">
              Debe ser entre 1 y 50 personas.
            </div>
          </div>

          <div class="col-md-12">
            <label for="rf_mesa" class="form-label text-white-50 small fw-bold text-uppercase"
              >Mesa Preferida</label
            >
            <select
              id="rf_mesa"
              class="form-select bg-dark text-white border-secondary py-2 shadow-none"
              formControlName="id_ct_mesa"
              [class.is-invalid]="
                form.get('id_ct_mesa')?.invalid && form.get('id_ct_mesa')?.touched
              "
            >
              <option [ngValue]="null" disabled selected>Selecciona una mesa...</option>
              @for (mesa of mesas(); track mesa.id) {
                <option [ngValue]="mesa.id">
                  Mesa {{ mesa.codigo }} (Capacidad: {{ mesa.capacidad }} pax)
                </option>
              }
            </select>
            <div class="invalid-feedback text-warning">
              Por favor, selecciona una mesa.
            </div>
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
export class ReservacionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mesasService = inject(MesasService);

  @Output() formSubmit = new EventEmitter<ReservacionBase>();
  @Input() isSubmitting = false;

  mesas = signal<Mesa[]>([]);

  form: FormGroup = this.fb.group({
    cliente: this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{8,20}$/)]],
    }),
    id_ct_mesa: [null, Validators.required],
    num_personas: [2, [Validators.required, Validators.min(1), Validators.max(50)]],
    fecha_reservacion: ['', Validators.required],
    notas: [''],
  });

  ngOnInit(): void {
    // Cargamos mesas de manera dinámica al iniciar el componente
    this.mesasService.getMesas({ estado: true, limite: 100 }).subscribe({
      next: (res) => {
        this.mesas.set(res.datos || []);
      },
      error: (err) => {
        console.error('Error al cargar mesas:', err);
      },
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const datos: ReservacionBase = {
        cliente: formValue.cliente,
        id_ct_mesa: Number(formValue.id_ct_mesa),
        num_personas: Number(formValue.num_personas),
        fecha_reservacion: new Date(formValue.fecha_reservacion).toISOString(),
        notas: formValue.notas || null,
      };
      this.formSubmit.emit(datos);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
