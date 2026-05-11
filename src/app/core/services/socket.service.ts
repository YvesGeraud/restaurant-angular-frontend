import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environments/environment';
import { NotificationService } from '@core/services/notification.service';
import { AuthStore } from '@core/auth/auth.store';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private readonly notifications = inject(NotificationService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  // Estado de la conexión
  connected = signal(false);

  conectar() {
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor de Sockets');
      this.connected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor de Sockets');
      this.connected.set(false);
    });

    // Escuchar eventos globales
    this.socket.on(
      'orden_nueva',
      (data: { mensaje: string; orden: { id_ct_usuario_reg: number } }) => {
        const currentUser = this.authStore.user();
        // Solo mostrar notificaciones si:
        // 1. El usuario está logueado y en el admin
        // 2. LA ORDEN NO LA HICE YO MISMO (para evitar spam personal)
        if (
          this.authStore.isAuthenticated() &&
          this.router.url.startsWith('/admin') &&
          data.orden.id_ct_usuario_reg !== currentUser?.id
        ) {
          this.notifications.info(data.mensaje, 'Nueva Orden');
          this.reproducirSonido();
        }
      },
    );

    this.socket.on(
      'orden_actualizada',
      (data: { mensaje: string; orden: { id_ct_usuario_mod: number; estado: string } }) => {
        const currentUser = this.authStore.user();
        if (
          this.authStore.isAuthenticated() &&
          this.router.url.startsWith('/admin') &&
          data.orden.id_ct_usuario_mod !== currentUser?.id
        ) {
          this.notifications.success(data.mensaje, 'Actualización');

          // Si la orden está LISTA, sonar el timbre para el mesero
          if (data.orden.estado === 'LISTO') {
            this.reproducirSonido();
          }
        }
      },
    );
  }

  desconectar() {
    this.socket?.disconnect();
  }

  on<T>(evento: string, callback: (data: T) => void) {
    this.socket?.on(evento, callback);
  }

  private reproducirSonido() {
    const audio = new Audio('assets/sounds/notification.mp3');
    audio.play().catch((e) => console.warn('No se pudo reproducir el sonido:', e));
  }
}
