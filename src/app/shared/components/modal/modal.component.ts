import { Component, input, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente Core Modal Reutilizable.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  /** Estado de visibilidad */
  readonly isOpen = input.required<boolean>();
  
  /** Título del modal */
  readonly title = input<string>('');
  
  /** Ancho máximo (ej: '500px') */
  readonly maxWidth = input<string>('600px');
  
  /** Indica si tiene botón de cierre automático en backdrop */
  readonly closeOnBackdrop = input<boolean>(true);
  
  /** Indica si se proyecta un footer */
  readonly hasFooter = input<boolean>(true);

  /** Evento de cierre */
  readonly close = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop()) {
      this.onClose();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }
}
