import { Component } from '@angular/core';
import { InputComponent } from '../../../shared/input/input';
import { ButtonComponent } from '../../../shared/button/button';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-recoverpass',
  standalone: true,
  imports: [InputComponent, ButtonComponent],
  templateUrl: './recoverpass.html',
  styleUrl: './recoverpass.css'
})
export class Recoverpass {
  loginForm: FormGroup;
  isLoading = false;
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get emailControl(): FormControl {
    return this.loginForm.get('email') as FormControl;
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

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      // Aquí iría la lógica para enviar los datos al servidor
      setTimeout(() => {
        this.isLoading = false;
        // Redirigir o mostrar mensaje de éxito
      }, 1000);
    }
  }
}
