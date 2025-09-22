import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../../services/auth';
import { InputComponent } from '../../../shared/input/input';
import { ButtonComponent } from '../../../shared/button/button';
import { StateService } from '../../../../services/state.service';
@Component({
  selector: 'app-verifycode',
  standalone: true,
  imports: [InputComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './verifycode.html',
  styleUrl: './verifycode.css'
})
export class Verifycode implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  verificationError: string | null = null;
  private apiUrl = 'http://147.135.215.156:8090/api/v1/auth/verify-code';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private stateService: StateService 
  ) {
    this.resetForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }
ngOnInit(): void {
  const email = this.stateService.getEmail();
  console.log(email);
    if (email) {
      this.emailControl.setValue(email);
    }
  }
  // Getter para el control del código de verificación
  get verificationCodeControl(): FormControl {
    return this.resetForm.get('verificationCode') as FormControl;
  }

  // Métodos de error para cada campo
  getVerificationCodeError(): string {
    const codeControl = this.resetForm.get('verificationCode');
    if (codeControl?.errors?.['required'] && codeControl.touched) {
      return 'El código de verificación es requerido';
    }
    if (codeControl?.errors?.['minlength'] && codeControl.touched) {
      return 'El código debe tener 6 caracteres';
    }
    if (codeControl?.errors?.['maxlength'] && codeControl.touched) {
      return 'El código debe tener 6 caracteres';
    }
    return '';
  }

  onSubmit() {
    this.verificationError = null;
    if (this.resetForm.valid) {
      this.isLoading = true;
      const email = this.emailControl.value;
      const verificationCode = this.verificationCodeControl.value;
      const verificationData = {
        email: email,
        code: verificationCode
      };

      this.http.post(this.apiUrl, verificationData, { observe: 'response' })
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.verificationError = 'Código de verificación incorrecto o expirado.';
            } else if (error.status === 500) {
              this.verificationError = 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.';
            } else {
              this.verificationError = 'Ocurrió un error inesperado.';
            }
            return of(null);
          })
        )
        .subscribe((response: any) => {
          console.log(response);
          if (response && response.status === 200) {
            const authToken = response.headers.get('Authorization');
            if (authToken) {
              this.authService.storeUserDatafa(authToken, response.body);
              this.router.navigate(['/dashboard']);
            } else {
              this.verificationError = 'Ocurrió un problema al autenticar.';
            }
          }
        });
    }
  }

  getEmailError(): string {
    const emailControl = this.resetForm.get('email');
    if (emailControl?.errors?.['required'] && emailControl.touched) {
      return 'El email es requerido';
    }
    if (emailControl?.errors?.['email'] && emailControl.touched) {
      return 'Formato de email inválido';
    }
    return '';
  }

  get emailControl(): FormControl {
    return this.resetForm.get('email') as FormControl;
  }
}