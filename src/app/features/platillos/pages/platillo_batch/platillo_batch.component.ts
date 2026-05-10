import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { PlatillosStore } from '../../store/platillos.store';
import { CategoriasStore } from '@shared/categorias/categorias.store';
import { CardComponent } from '@shared/components/card/card.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-platillo-batch',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent],
  templateUrl: './platillo_batch.component.html',
  styleUrl: './platillo_batch.component.scss'
})
export class PlatilloBatchComponent {
  protected readonly store = inject(PlatillosStore);
  
  onProcesar(): void {
    // Placeholder para la carga masiva
  }
}
