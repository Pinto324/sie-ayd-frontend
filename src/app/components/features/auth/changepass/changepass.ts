import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { InputComponent } from '../../../shared/input/input';
import { ButtonComponent } from '../../../shared/button/button';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-changepass',
  imports: [InputComponent, ButtonComponent, FormsModule],
  templateUrl: './changepass.html',
  styleUrl: './changepass.css'
})
export class Changepass implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  email: string | null = null;
  private apiUrl = 'http://147.135.215.156:8090/api/v1/auth/change-password';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.resetForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get email from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || null;
    });
  }

  // Getter para el control del código de verificación
  get verificationCodeControl(): FormControl {
    return this.resetForm.get('verificationCode') as FormControl;
  }

  // Getter para el control de nueva contraseña
  get newPasswordControl(): FormControl {
    return this.resetForm.get('newPassword') as FormControl;
  }

  // Getter para el control de confirmar contraseña
  get confirmPasswordControl(): FormControl {
    return this.resetForm.get('confirmPassword') as FormControl;
  }

  // Validador personalizado para coincidencia de contraseñas
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }

    return null;
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

  getNewPasswordError(): string {
    const passwordControl = this.resetForm.get('newPassword');
    if (passwordControl?.errors?.['required'] && passwordControl.touched) {
      return 'La nueva contraseña es requerida';
    }
    if (passwordControl?.errors?.['minlength'] && passwordControl.touched) {
      return 'Mínimo 6 caracteres';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const confirmControl = this.resetForm.get('confirmPassword');
    if (confirmControl?.errors?.['required'] && confirmControl.touched) {
      return 'Debes confirmar la contraseña';
    }
    if (confirmControl?.errors?.['passwordMismatch'] && confirmControl.touched) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    // Validate that email exists
    if (!this.email) {
      this.errorMessage = 'No se encontró el email. Por favor, inicie el proceso de recuperación nuevamente.';
      this.cdr.detectChanges();
      return;
    }

    if (this.resetForm.valid) {
      this.isLoading = true;
      this.cdr.detectChanges();

      const requestBody = {
        code: this.resetForm.value.verificationCode,
        email: this.email,
        newPassword: this.resetForm.value.newPassword
      };

      this.http.post(this.apiUrl, requestBody).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Contraseña cambiada exitosamente';
          this.resetForm.disable();
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Ocurrió un error al cambiar la contraseña. Inténtelo nuevamente.';
          }
          this.cdr.detectChanges();
        }
      });
    }
  }
}
