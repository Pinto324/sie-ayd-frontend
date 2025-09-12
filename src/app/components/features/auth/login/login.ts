import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/button/button';
import { InputComponent } from '../../../shared/input/input';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InputComponent, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;

  @Output() loginSubmit = new EventEmitter<{ email: string, password: string }>();

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginSubmit.emit(this.loginForm.value);

      // Reset loading state after simulation (en realidad lo haría el servicio)
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
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
