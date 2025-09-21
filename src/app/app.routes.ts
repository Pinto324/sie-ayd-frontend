import { Routes } from '@angular/router';
import { Inicio } from './views/inicio/inicio';
import { Login } from './components/features/auth/login/login'; // Asegúrate de importar tu componente de login
import { Register } from './components/features/auth/register/register';
import { Verifycode } from './components/features/auth/verifycode/verifycode';
import { Changepass } from './components/features/auth/changepass/changepass';
import { Recoverpass } from './components/features/auth/recoverpass/recoverpass';
import { Dashboard } from './components/features/dashboard/dashboard';
import { Usuarios } from './views/admin/usuarios/usuarios';
export const routes: Routes = [
  // Ruta para la página de inicio, que muestra el componente InicioComponent
  { path: '', component: Inicio },

  // Ruta para el login, que muestra el componente LoginComponent
  { path: 'login', component: Login },

  { path: 'register', component: Register },

  { path: 'verifycode', component: Verifycode },

  { path: 'changepass', component: Changepass },

  { path: 'recoverpass', component: Recoverpass },
  { path: 'dashboard', component: Dashboard },
  { path: 'ModuloUsuario', component: Usuarios },
  // Opcional: una ruta comodín para cualquier otra URL no reconocida
  { path: '**', redirectTo: '' }
];
