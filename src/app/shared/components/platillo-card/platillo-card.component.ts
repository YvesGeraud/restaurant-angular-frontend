import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Platillo } from '../../../features/platillos/models/platillo.model';

@Component({
  selector: 'app-platillo-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './platillo-card.component.html',
  styleUrl: './platillo-card.component.scss'
})
export class PlatilloCardComponent {
  platillo = input.required<Platillo>();
  onClick = output<Platillo>();
}
