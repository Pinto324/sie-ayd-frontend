import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/button/button';
import { InputComponent } from '../../../shared/input/input';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../../services/auth';
import { StateService } from '../../../../services/state.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InputComponent, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
 registerForm: FormGroup;
  isLoading = false;
  registerError: string | null = null;
  
  private apiUrl = 'http://147.135.215.156:8090/api/v1/auth/signup';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private stateService: StateService
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.registerError = null;

    if (this.registerForm.valid) {
      this.isLoading = true;
      this.cdr.markForCheck();

      const userData = this.registerForm.value;

      this.http.post(this.apiUrl, userData, { observe: 'response' })
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 409) {
              this.registerError = 'El email ya está registrado.';
            } else if (error.status === 500) {
              this.registerError = 'Error de conexión. Por favor, verifica tu internet.';
            } else {
              this.registerError = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
            }
            this.cdr.markForCheck();
            return of(null);
          })
        )
        .subscribe((response: any) => {
          if (response && response.status === 200) {
            this.router.navigate(['/login']);
          }
        });
    }
  }

  get firstnameControl(): FormControl {
    return this.registerForm.get('firstname') as FormControl;
  }
  
  get lastnameControl(): FormControl {
    return this.registerForm.get('lastname') as FormControl;
  }

  get emailControl(): FormControl {
    return this.registerForm.get('email') as FormControl;
  }

  get phoneNumberControl(): FormControl {
    return this.registerForm.get('phoneNumber') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.registerForm.get('password') as FormControl;
  }
  
  // Métodos para obtener errores de validación
  getFirstNameError(): string {
    const control = this.firstnameControl;
    return (control?.errors?.['required'] && control.touched) ? 'El nombre es requerido' : '';
  }

  getLastNameError(): string {
    const control = this.lastnameControl;
    return (control?.errors?.['required'] && control.touched) ? 'El apellido es requerido' : '';
  }
  
  getEmailError(): string {
    const control = this.emailControl;
    if (control?.errors?.['required'] && control.touched) {
      return 'El email es requerido';
    }
    if (control?.errors?.['email'] && control.touched) {
      return 'Formato de email inválido';
    }
    return '';
  }

  getPhoneNumberError(): string {
    const control = this.phoneNumberControl;
    return (control?.errors?.['required'] && control.touched) ? 'El número de teléfono es requerido' : '';
  }

  getPasswordError(): string {
    const control = this.passwordControl;
    if (control?.errors?.['required'] && control.touched) {
      return 'La contraseña es requerida';
    }
    if (control?.errors?.['minlength'] && control.touched) {
      return 'Mínimo 6 caracteres';
    }
    return '';
  }
}
