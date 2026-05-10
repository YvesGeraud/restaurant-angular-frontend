import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';

/**
 * Directiva estructural para mostrar/ocultar contenido según permisos.
 * Uso: *appHasPermission="'PLATILLOS_CREAR'"
 * Uso múltiple: *appHasPermission="['PLATILLOS_EDITAR', 'PLATILLOS_BORRAR']"
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);

  private permissions: string | string[] = [];
  private hasView = false;

  @Input('appHasPermission') set appHasPermission(val: string | string[]) {
    this.permissions = val;
    this.updateView();
  }

  constructor() {
    // Reaccionar a cambios en el estado de autenticación automáticamente
    effect(() => {
      this.updateView();
    });
  }

  private updateView() {
    const hasPermission = this.authStore.hasPermission(this.permissions);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
