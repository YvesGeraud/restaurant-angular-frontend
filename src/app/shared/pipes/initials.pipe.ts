import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true,
})
export class InitialsPipe implements PipeTransform {
  /**
   * Obtiene las iniciales de un nombre completo.
   * Uso: {{ 'Juan Pérez' | initials }} -> JP
   */
  transform(value: string | undefined | null): string {
    if (!value) return '';
    const parts = value
      .trim()
      .split(' ')
      .filter((p) => p.length > 0);
    if (parts.length === 0) return '';

    const initials = parts.map((p) => p.charAt(0).toUpperCase());
    if (initials.length === 1) return initials[0];

    // Devolver las primeras dos iniciales
    return (initials[0] + (initials[1] || '')).substring(0, 2);
  }
}
