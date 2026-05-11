import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login_page.component.html',
  styleUrl: './login_page.component.scss',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  readonly showPassword = signal(false);

  readonly loginForm = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      const rawValue = this.loginForm.getRawValue();
      this.authStore.login({
        usuario: rawValue.usuario || '',
        contrasena: rawValue.contrasena || '',
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
