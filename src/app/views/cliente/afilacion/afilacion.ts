import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../components/shared/button/button';
import { InputComponent } from '../../../components/shared/input/input';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth';
import { StateService } from '../../../services/state.service';
@Component({
  selector: 'app-afilacion',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InputComponent, ReactiveFormsModule, RouterModule],
  templateUrl: './afilacion.html',
  styleUrl: './afilacion.css',
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class Afilacion {
  commerceRegisterForm: FormGroup;
  isLoading = false;
  isRegistered = false;
  registerError: string | null = null;
  registerTrue: string | null = null;

  private apiUrl = 'http://147.135.215.156:8090/api/v1/commerce/register';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private stateService: StateService
  ) {
    this.commerceRegisterForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nit: ['', Validators.required],
    });
  }
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  onSubmit() {
    this.registerError = null;
    this.registerTrue = null;

    if (this.commerceRegisterForm.valid) {
      this.isLoading = true;
      const headers = this.getHeaders();
      const commerceData = this.commerceRegisterForm.value;

      this.http.post(this.apiUrl, commerceData, { headers })
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            this.registerTrue = 'Se realizó la solicitud correctamente!';
            this.commerceRegisterForm.disable();
            this.isRegistered = true;
            this.cdr.detectChanges();
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;

            if (error.status === 400 && error.error && Array.isArray(error.error)) {
              const errorMessages = error.error.map((err: any) => err.message).join(', ');
              this.registerError = errorMessages;
            } else if (error.status === 400) {
              this.registerError = 'Error de validación en los datos enviados.';
            } else if (error.status === 500) {
              this.registerError = 'Error de conexión. Por favor, verifica tu internet.';
            } else {
              this.registerError = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
            }

            // Forzar detección de cambios con setTimeout
            setTimeout(() => {
              this.cdr.detectChanges();
            });
            // También marca para check
            this.cdr.markForCheck();
          }
        });
    }
  }

  get nameControl(): FormControl {
    return this.commerceRegisterForm.get('name') as FormControl;
  }

  get emailControl(): FormControl {
    return this.commerceRegisterForm.get('email') as FormControl;
  }

  get phoneNumberControl(): FormControl {
    return this.commerceRegisterForm.get('phoneNumber') as FormControl;
  }

  get addressControl(): FormControl {
    return this.commerceRegisterForm.get('address') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.commerceRegisterForm.get('password') as FormControl;
  }

  get nitControl(): FormControl {
    return this.commerceRegisterForm.get('nit') as FormControl;
  }

  // Métodos para obtener errores de validación
  getNameError(): string {
    const control = this.nameControl;
    return (control?.errors?.['required'] && control.touched) ? 'El nombre del comercio es requerido' : '';
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

  getAddressError(): string {
    const control = this.addressControl;
    return (control?.errors?.['required'] && control.touched) ? 'La dirección es requerida' : '';
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

  getNitError(): string {
    const control = this.nitControl;
    return (control?.errors?.['required'] && control.touched) ? 'El NIT es requerido' : '';
  }
}
