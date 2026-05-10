import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Platillo } from '../../models/platillo.model';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
import { StatusBadgePipe } from '@shared/pipes/status_badge.pipe';
import { CardComponent } from '@shared/components/card/card.component';

@Component({
  selector: 'app-platillo-card',
  standalone: true,
  imports: [
    CommonModule, 
    CurrencyPipe, 
    TruncatePipe, 
    StatusBadgePipe,
    CardComponent
  ],
  templateUrl: './platillo_card.component.html',
  styleUrl: './platillo_card.component.scss'
})
export class PlatilloCardComponent {
  /** El modelo del platillo a mostrar */
  readonly platillo = input.required<Platillo>();

  /** Emite el platillo cuando el usuario hace clic en "Editar" */
  readonly onEdit = output<Platillo>();

  /** Emite el platillo cuando el usuario hace clic en "Eliminar" */
  readonly onDelete = output<Platillo>();

  /** Emite el platillo cuando el usuario hace clic en "Reactivar" */
  readonly onActivate = output<Platillo>();
}
