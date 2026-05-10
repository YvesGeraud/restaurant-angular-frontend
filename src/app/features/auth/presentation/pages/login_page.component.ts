import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '@core/auth/auth.store';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login_page.component.html',
  styleUrl: './login_page.component.scss'
})
export class LoginPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);
  private readonly notifications = inject(NotificationService);

  readonly showPassword = signal(false);
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya estamos autenticados por alguna razÃ³n, el guard deberÃ­a sacarnos, 
    // pero nos aseguramos de no mostrar cargando eternamente.
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authStore.login(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}

