import { Routes } from '@angular/router';
import { Inicio } from './views/inicio/inicio';
import { Login } from './components/features/auth/login/login'; // Asegúrate de importar tu componente de login

export const routes: Routes = [
  // Ruta para la página de inicio, que muestra el componente InicioComponent
  { path: '', component: Inicio },

  // Ruta para el login, que muestra el componente LoginComponent
  { path: 'login', component: Login },

  // Opcional: una ruta comodín para cualquier otra URL no reconocida
  { path: '**', redirectTo: '' }
];
