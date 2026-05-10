import { Component, input, output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Mesa, MesaFormData } from '../../models/mesa.model';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
  selector: 'app-mesa-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './mesa_modal.component.html',
  styleUrl: './mesa_modal.component.scss'
})
export class MesaModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  /** Estado de visibilidad (controlado por el padre) */
  readonly isOpen = input.required<boolean>();
  
  /** Mesa a editar (null si es creación) */
  readonly mesa = input<Mesa | null>(null);

  /** Eventos */
  readonly close = output<void>();
  readonly save = output<MesaFormData>();

  form: FormGroup = this.initForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mesa'] && this.isOpen()) {
      this.resetForm(this.mesa());
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.value);
  }

  private initForm(): FormGroup {
    return this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      capacidad: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      status: ['libre', [Validators.required]],
      estado: [true, [Validators.required]]
    });
  }

  private resetForm(mesa: Mesa | null): void {
    if (mesa) {
      this.form.patchValue({
        codigo: mesa.codigo,
        capacidad: mesa.capacidad,
        status: mesa.status,
        estado: mesa.estado
      });
    } else {
      this.form.reset({
        codigo: '',
        capacidad: 2,
        status: 'libre',
        estado: true
      });
    }
  }
}
