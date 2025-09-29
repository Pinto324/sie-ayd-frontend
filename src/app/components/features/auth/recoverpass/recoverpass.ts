import { Component, ChangeDetectorRef } from '@angular/core';
import { InputComponent } from '../../../shared/input/input';
import { ButtonComponent } from '../../../shared/button/button';
import {FormBuilder, FormGroup, Validators, FormControl, FormsModule} from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recoverpass',
  standalone: true,
  imports: [InputComponent, ButtonComponent, FormsModule],
  templateUrl: './recoverpass.html',
  styleUrl: './recoverpass.css'
})
export class Recoverpass {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  private apiUrl = 'http://147.135.215.156:8090/api/v1/auth/recover-password';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
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
    this.errorMessage = null;

    if (this.loginForm.valid) {
      this.isLoading = true;
      const email = this.loginForm.value.email;
      console.log(email);

      this.http.post(this.apiUrl, { email }).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.router.navigate(['/changepass'], { queryParams: { email } });
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;

          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Ocurrió un error al procesar la solicitud. Inténtelo nuevamente.';
          }

          this.cdr.detectChanges();
        }
      });
    }
  }
}
