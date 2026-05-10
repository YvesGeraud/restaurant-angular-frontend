import { Routes } from '@angular/router';
import { PlatillosService } from './services/platillos.service';
import { PlatillosStore } from './store/platillos.store';
import { PlatillosComponent } from './pages/platillos/platillos.component';
import { PlatilloBatchComponent } from './pages/platillo_batch/platillo_batch.component';

export const PLATILLOS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      PlatillosService,
      PlatillosStore,
    ],
    children: [
      {
        path: '',
        component: PlatillosComponent,
      },
      {
        path: 'batch',
        component: PlatilloBatchComponent,
      }
    ]
  },
];

