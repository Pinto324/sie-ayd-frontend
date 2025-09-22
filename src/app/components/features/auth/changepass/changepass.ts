import { Component } from '@angular/core';
import { InputComponent } from '../../../shared/input/input';
import { ButtonComponent } from '../../../shared/button/button';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-changepass',
  imports: [InputComponent, ButtonComponent],
  templateUrl: './changepass.html',
  styleUrl: './changepass.css'
})
export class Changepass {
  resetForm: FormGroup;
  isLoading = false;
  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
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
    if (this.resetForm.valid) {
      this.isLoading = true;
      console.log('Datos del formulario:', this.resetForm.value);

      // Aquí iría la lógica para enviar los datos al servidor
      setTimeout(() => {
        this.isLoading = false;
        // Redirigir o mostrar mensaje de éxito
      }, 1000);
    }
  }
}
