import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '@core/auth/auth.store';
import { SocketService } from '@core/services/socket.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('Frontend');
  readonly authStore = inject(AuthStore);
  private readonly socketService = inject(SocketService);

  ngOnInit(): void {
    this.authStore.initSession();
    this.socketService.conectar();
  }
}
