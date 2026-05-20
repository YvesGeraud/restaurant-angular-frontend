import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent {
  placeholder = input<string>('Buscar...');
  width = input<string>('250px');
  buscar = output<string>();

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.buscar.emit(value);
  }
}
