import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string, title = '¡Éxito!'): void {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  error(message: string, title = 'Error'): void {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
    });
  }

  warning(message: string, title = 'Advertencia'): void {
    Swal.fire({
      icon: 'warning',
      title,
      text: message,
    });
  }

  info(message: string, title = 'Información'): void {
    Swal.fire({
      icon: 'info',
      title,
      text: message,
    });
  }

  confirm(
    message: string,
    title = '¿Estás seguro?',
    confirmText = 'Sí, continuar',
  ): Observable<boolean> {
    return from(
      Swal.fire({
        title,
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981', // Emerald primary
        cancelButtonColor: '#6366f1', // Indigo secondary
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar',
      }).then((result) => result.isConfirmed),
    );
  }
}
