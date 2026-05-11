import { Routes } from '@angular/router';
import { MesasService } from './services/mesas.service';
import { MesasStore } from './store/mesa.store';
import { MesasComponent } from './pages/mesas/mesas.component';
import { MesasBatchComponent } from './pages/mesas_batch/mesas_batch.component';

export const MESAS_ROUTES: Routes = [
  {
    path: '',
    providers: [MesasService, MesasStore],
    children: [
      {
        path: '',
        component: MesasComponent,
      },
      {
        path: 'batch',
        component: MesasBatchComponent,
      },
    ],
  },
];
