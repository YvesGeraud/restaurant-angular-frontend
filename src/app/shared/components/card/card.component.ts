import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  /** Activa el efecto de elevación al pasar el mouse */
  readonly hoverable = input<boolean>(true);

  /** Padding personalizado para el contenedor */
  readonly padding = input<string>('0');
}
