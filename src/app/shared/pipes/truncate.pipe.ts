import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  /**
   * Trunca un texto a una longitud máxima y añade el sufijo deseado.
   * Uso: {{ texto | truncate:20:'...' }}
   */
  transform(value: string | undefined | null, limit = 20, suffix = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit) + suffix;
  }
}
