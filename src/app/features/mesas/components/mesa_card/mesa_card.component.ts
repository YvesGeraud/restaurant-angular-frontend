import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mesa } from '../../models/mesa.model';
import { StatusBadgePipe } from '@shared/pipes/status_badge.pipe';
import { CardComponent } from '@shared/components/card/card.component';

@Component({
  selector: 'app-mesa-card',
  standalone: true,
  imports: [
    CommonModule, 
    StatusBadgePipe,
    CardComponent
  ],
  templateUrl: './mesa_card.component.html',
  styleUrl: './mesa_card.component.scss'
})
export class MesaCardComponent {
  /** El modelo de la mesa a mostrar */
  readonly mesa = input.required<Mesa>();

  /** Emite la mesa cuando el usuario hace clic en "Editar" */
  readonly onEdit = output<Mesa>();

  /** Emite la mesa cuando el usuario hace clic en "Eliminar" */
  readonly onDelete = output<Mesa>();

  /** Emite la mesa cuando el usuario hace clic en "Reactivar" */
  readonly onActivate = output<Mesa>();
}
