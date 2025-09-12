import { Component } from '@angular/core';
import { InputComponent } from '../../../shared/input/input';
import { ButtonComponent } from '../../../shared/button/button';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
@Component({
  selector: 'app-verifycode',
  standalone: true,
  imports: [InputComponent, ButtonComponent],
  templateUrl: './verifycode.html',
  styleUrl: './verifycode.css'
})
export class Verifycode {
  resetForm: FormGroup;
  isLoading = false;
  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    })
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
