import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/button/button'; 
@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, ButtonComponent, ReactiveFormsModule], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
 loginForm: FormGroup;
  isLoading = false;

  @Output() loginSubmit = new EventEmitter<{email: string, password: string}>();

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
}
