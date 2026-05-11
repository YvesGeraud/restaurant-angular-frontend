import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Platillo, PlatilloFormData } from '../../models/platillo.model';
import { CategoriasStore } from '@shared/categorias/categorias.store';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
  selector: 'app-platillo-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './platillo_modal.component.html',
  styleUrl: './platillo_modal.component.scss',
})
export class PlatilloModalComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  protected readonly categoriaStore = inject(CategoriasStore);

  /** Estado de visibilidad (controlado por el padre) */
  readonly isOpen = input.required<boolean>();

  /** Platillo a editar (null si es creación) */
  readonly platillo = input<Platillo | null>(null);

  /** Eventos */
  readonly modalClose = output<void>();
  readonly save = output<PlatilloFormData>();

  form: FormGroup = this.initForm();

  ngOnInit(): void {
    this.categoriaStore.cargarCategorias();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['platillo'] && this.isOpen()) {
      this.resetForm(this.platillo());
    }
  }

  onClose(): void {
    this.modalClose.emit();
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
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      idCategoria: [null, [Validators.required]],
      descripcion: ['', [Validators.maxLength(500)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      imagenUrl: [''],
      estado: [true],
    });
  }

  private resetForm(platillo: Platillo | null): void {
    if (platillo) {
      this.form.patchValue({
        nombre: platillo.nombre,
        idCategoria: platillo.categoria.id,
        descripcion: platillo.descripcion,
        precio: platillo.precio,
        imagenUrl: platillo.imagenUrl,
        estado: platillo.estado,
      });
    } else {
      this.form.reset({
        nombre: '',
        idCategoria: null,
        descripcion: '',
        precio: 0,
        imagenUrl: '',
        estado: true,
      });
    }
  }
}
