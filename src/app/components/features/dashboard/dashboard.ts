import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBuilding, faUserTie, faChartBar, faCog, faFileAlt, faDumpster, faIdCardClip } from '@fortawesome/free-solid-svg-icons';
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
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  modules: ModuleCard[] = [];
  userRoleId: number | null = null;
  filteredModules: ModuleCard[] = [];

  constructor(
    private authService: AuthService,
    private library: FaIconLibrary
  ) {
    // Agregar iconos a la librería
    library.addIcons(faUsers, faBuilding, faUserTie, faChartBar, faCog, faFileAlt, faDumpster, faIdCardClip);
  }

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
        icon: 'users',
        route: '/ModuloUsuario',
        roleAccess: [1] // Roles 1 y 2 pueden acceder
      },
      {
        id: 2,
        title: 'Módulo de Sucursales',
        description: 'Administra las sucursales de la empresa, sus datos y configuración.',
        icon: 'building',
        route: '/branches',
        roleAccess: [1] // Roles 1 y 3 pueden acceder
      },
      {
        id: 3,
        title: 'Módulo de Trabajadores',
        description: 'Controla la información de los trabajadores y sus asignaciones.',
        icon: 'user-tie',
        route: '/workers',
        roleAccess: [1] // Solo rol 1 puede acceder
      },
      {
        id: 4,
        title: 'Módulo de Comercio',
        description: 'Controla la información de los comercios.',
        icon: 'dumpster',
        route: '/commerce',
        roleAccess: [1]
      },
      {
        id: 5,
        title: 'Módulo de Reportes',
        description: 'Genera reportes y estadísticas del sistema.',
        icon: 'id-card-clip',
        route: '/reports',
        roleAccess: [1, 2]
      },
      {
        id: 6,
        title: 'Módulo de Configuración',
        description: 'Configuración general del sistema y preferencias.',
        icon: 'gear',
        route: '/settings',
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
