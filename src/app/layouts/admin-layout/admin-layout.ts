import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterModule, NavbarComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  readonly authStore = inject(AuthStore);
}
