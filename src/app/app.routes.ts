import { Routes } from '@angular/router';
import { Inicio } from './views/inicio/inicio';
import { Login } from './components/features/auth/login/login';
import { Register } from './components/features/auth/register/register';
import { Verifycode } from './components/features/auth/verifycode/verifycode';
import { Changepass } from './components/features/auth/changepass/changepass';
import { Recoverpass } from './components/features/auth/recoverpass/recoverpass';
import { Guia } from './components/features/auth/guia/guia';
import { Dashboard } from './components/features/dashboard/dashboard';
import { Usuarios } from './views/admin/usuarios/usuarios';
import { Sucursal } from './views/admin/sucursal/sucursal';
import { Repartidor } from './views/admin/repartidor/repartidor';
import { Precios } from './views/admin/precios/precios';
import { Afilacion } from './views/cliente/afilacion/afilacion';
import { Guias } from './views/comercios/guias/guias';
import { GuiasCliente } from './views/cliente/guias/guias';
import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/adminguard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'verifycode', component: Verifycode },
  { path: 'changepass', component: Changepass },
  { path: 'recoverpass', component: Recoverpass },
  { path: 'buscapaquete', component: Guia },
  // Rutas protegidas
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [AuthGuard]
  }, {
    path: 'afilacion',
    component: Afilacion,
    canActivate: [AuthGuard]
  }, {
    path: 'guias',
    component: Guias,
    canActivate: [AuthGuard]
  }, {
    path: 'guiascliente',
    component: GuiasCliente,
    canActivate: [AuthGuard]
  },

  // Ruta protegida para administradores
  {
    path: 'ModuloUsuario',
    component: Usuarios,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'ModuloSucursal',
    component: Sucursal,
    canActivate: [AuthGuard, AdminGuard]
  }, {
    path: 'ModuloRepartidor',
    component: Repartidor,
    canActivate: [AuthGuard, AdminGuard]
  }, {
    path: 'ModuloPrecios',
    component: Precios,
    canActivate: [AuthGuard, AdminGuard]
  },

  { path: '**', redirectTo: '' }
];