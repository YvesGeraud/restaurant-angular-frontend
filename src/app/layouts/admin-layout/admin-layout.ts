import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { AuthStore } from '@core/auth/auth.store';
import { SocketService } from '@core/services/socket.service';
import { HasPermissionDirective } from '@shared/directives/has_permission.directive';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, NavbarComponent, HasPermissionDirective],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit, OnDestroy {
  readonly authStore = inject(AuthStore);
  private readonly socketService = inject(SocketService);

  ngOnInit() {
    this.socketService.conectar();
  }

  ngOnDestroy() {
    this.socketService.desconectar();
  }
}
