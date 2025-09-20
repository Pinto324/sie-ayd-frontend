import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
interface ModuleCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  route: string;
  roleAccess: number[]; // Roles que pueden acceder a este módulo
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  modules: ModuleCard[] = [];
  userRoleId: number | null = null;
  filteredModules: ModuleCard[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userRoleId = this.authService.getRoleId();
    this.initializeModules();
    this.filterModulesByRole();
  }

  private initializeModules(): void {
    this.modules = [
      {
        id: 1,
        title: 'Módulo de Usuarios',
        description: 'Gestiona los usuarios del sistema, crea, edita y elimina cuentas de usuario.',
        icon: '👥',
        route: '/users',
        roleAccess: [1, 2] // Roles 1 y 2 pueden acceder
      },
      {
        id: 2,
        title: 'Módulo de Sucursales',
        description: 'Administra las sucursales de la empresa, sus datos y configuración.',
        icon: '🏢',
        route: '/branches',
        roleAccess: [1, 3] // Roles 1 y 3 pueden acceder
      },
      {
        id: 3,
        title: 'Módulo de Trabajadores',
        description: 'Controla la información de los trabajadores y sus asignaciones.',
        icon: '👨‍💼',
        route: '/workers',
        roleAccess: [1] // Solo rol 1 puede acceder
      },
      {
        id: 4,
        title: 'Módulo de Reportes',
        description: 'Genera reportes y estadísticas del sistema.',
        icon: '📊',
        route: '/reports',
        roleAccess: [1, 2]
      },
      {
        id: 5,
        title: 'Módulo de Configuración',
        description: 'Configuración general del sistema y preferencias.',
        icon: '⚙️',
        route: '/settings',
        roleAccess: [1]
      },
      {
        id: 6,
        title: 'Módulo de Auditoría',
        description: 'Registros de actividades y auditoría del sistema.',
        icon: '📝',
        route: '/audit',
        roleAccess: [1]
      }
    ];
  }

  private filterModulesByRole(): void {
    if (this.userRoleId !== null) {
      this.filteredModules = this.modules.filter(module =>
        module.roleAccess.includes(this.userRoleId!)
      );
    } else {
      this.filteredModules = [];
    }
  }

  // Método para dividir los módulos en grupos de 3 para el grid
  getModuleGroups(): ModuleCard[][] {
    const groups = [];
    for (let i = 0; i < this.filteredModules.length; i += 3) {
      groups.push(this.filteredModules.slice(i, i + 3));
    }
    return groups;
  }
}
