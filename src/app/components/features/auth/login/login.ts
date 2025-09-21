import { Component, Output, EventEmitter, NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/button/button';
import { InputComponent } from '../../../shared/input/input';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InputComponent, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush // 👈 Opcional: mejor rendimiento
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  loginError: string | null = null;

  @Output() loginSubmit = new EventEmitter<{ email: string, password: string }>();

  private apiUrl = 'http://147.135.215.156:8090/api/v1/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.loginError = null;

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.cdr.markForCheck(); // 👈 Marca para verificación en el próximo ciclo

      const credentials = this.loginForm.value;
      this.loginSubmit.emit(credentials);

      this.http.post(this.apiUrl, credentials, { observe: 'response' })
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }),
          catchError((error: HttpErrorResponse) => {

            if (error.status === 500) {
              this.loginError = 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.';
            } else if (error.status === 0) {
              this.loginError = 'Error de conexión. Verifica tu conexión a internet.';
            } else {
              this.loginError = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
            }

            this.cdr.markForCheck(); // 👈 Marca para verificación inmediata

            return of(null);
          })
        )
        .subscribe((response: any) => {
          if (response && response.status === 200) {
            const authToken = response.headers.get('Authorization');
            if (authToken) {
              // Usa el servicio para guardar los datos
              this.authService.storeUserData(authToken, response.body);
              console.log(response.body.use2fa);
              if (response.body.use2fa) {
                this.router.navigate(['/verifycode']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            } else {
              this.loginError = 'Ocurrió un problema al autenticar.';
              this.cdr.markForCheck();
            }
          }
        });
    }
  }

  getEmailError(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.errors?.['required'] && emailControl.touched) {
      return 'El email es requerido';
    }
    if (emailControl?.errors?.['email'] && emailControl.touched) {
      return 'Formato de email inválido';
    }
    return '';
  }

  getPasswordError(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.errors?.['required'] && passwordControl.touched) {
      return 'La contraseña es requerida';
    }
    if (passwordControl?.errors?.['minlength'] && passwordControl.touched) {
      return 'Mínimo 6 caracteres';
    }
    return '';
  }

  get passwordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get emailControl(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }
}