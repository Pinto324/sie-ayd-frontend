import { Component } from '@angular/core';
import { Auth, LoginData } from '../../services/auth';
import { Login } from '../../components/features/auth/login/login';
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [Login],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
 constructor(private authService: Auth) {}

  onLoginSubmit(credentials: LoginData) {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        // Redirigir o manejar éxito
      },
      error: (error) => {
        console.error('Error en login', error);
        // Mostrar error al usuario
      }
    });
  }
}
