import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBuilding,faMoneyBill, faHammer,faMoneyCheck, faUserTie, faChartBar, faCog, faFileAlt, faPercent, faDumpster, faIdCardClip, faBoxesStacked } from '@fortawesome/free-solid-svg-icons';
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
  guidemodule= "un modulo";
  guidename= "Paquetes";
  
  constructor(
    private authService: AuthService,
    private library: FaIconLibrary
  ) {
    // Agregar iconos a la librería
    library.addIcons(faUsers, faMoneyBill,faHammer,faPercent, faMoneyCheck, faBuilding, faUserTie, faChartBar, faCog, faFileAlt, faDumpster, faIdCardClip, faBoxesStacked);
  }

  ngOnInit() {
    this.userRoleId = this.authService.getRoleId();
    
    switch (this.userRoleId) { 
      case 1:
      case 4:
        this.guidemodule = "Modulo para ver la información y el estado de los paquetes"
        this.guidename = "Módulo de paquetes"
        break;
      case 5:
        this.guidemodule = "Todas la información y configuraciones del estado de tu paquete!."
        this.guidename = "Paquetes"
        break;
      default:
        break;
    }
    this.initializeModules();
    this.filterModulesByRole();
  }

  private initializeModules(): void {
    this.modules = [
    {
        id: 1,
        title: this.guidename,
        description: this.guidemodule,
        icon: 'boxes-stacked',
        route: '/guiascliente',
        roleAccess: [1,4,5]
      },
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
        icon: 'dumpster',
        route: '/ModuloSucursal',
        roleAccess: [1] // Roles 1 y 3 pueden acceder
      },
      {
        id: 3,
        title: 'Módulo de repartidores',
        description: 'Controla la información de los repartidores y sus contratos.',
        icon: 'user-tie',
        route: '/ModuloRepartidor',
        roleAccess: [1] // Solo rol 1 puede acceder
      },
      {
        id: 4,
        title: 'Módulo de precios',
        description: 'Controla los precios o porcentajes de distintas funcionalidades del sistema.',
        icon: 'percent',
        route: '/ModuloPrecios',
        roleAccess: [1]
      },
      {
        id: 5,
        title: 'Módulo de guias',
        description: 'Revisa todas las guías en el sistema.',
        icon: 'money-check',
        route: '/ModuloGuias',
        roleAccess: [1]
      },
      {
        id: 6,
        title: 'Módulo de Reportes',
        description: 'Genera reportes y estadísticas del sistema.',
        icon: 'id-card-clip',
        route: '/ModuloReportes',
        roleAccess: [1]
      },
      {
        id: 1,
        title: 'Guias de entrega',
        description: 'Control de las guías de tus paquetes.',
        icon: 'money-check',
        route: '/guias',
        roleAccess: [2]
      },{
        id: 2,
        title: 'Informacion de fidelización',
        description: 'Mira un reporte de tu rendimiento.',
        icon: 'id-card-clip',
        route: '/fidelizacioncomercio',
        roleAccess: [2]
      },{
        id: 3,
        title: 'cierres de caja',
        description: 'Informacion de tus cierres de caja.',
        icon: 'id-card-clip',
        route: '/cajacomercios',
        roleAccess: [2]
      },{
        id: 1,
        title: 'Solicitud de paquetes',
        description: 'Revisa y controla todos las solicitudes de paquetes que tienes asignadas!.',
        icon: 'money-check',
        route: '/asignacionrepartidor',
        roleAccess: [3]
      },{
        id: 2,
        title: 'Modulo de entregas',
        description: 'Maneja tu progreso con las entregas que tienes asignadas!',
        icon: 'boxes-stacked',
        route: '/entregasrepartidor',
        roleAccess: [3]
      },{
        id: 3,
        title: 'Historial de pagos',
        description: 'Mira todos los pagos que te han realizado!',
        icon: 'money-bill',
        route: '/pagosrepartidor',
        roleAccess: [3]
      },{
        id: 1,
        title: 'Asignaciones',
        description: 'Modulo para repartir los paquetes entre los repartidores libres!',
        icon: 'dumpster',
        route: '/asignacioncoordinador',
        roleAccess: [4]
      },{
        id: 2,
        title: 'Incidencias',
        description: 'Modulo para resolver las incidencias de las entregas',
        icon: 'hammer',
        route: '/IncidenciaCoordinador',
        roleAccess: [4]
      },{
        id: 3,
        title: 'Fidelización',
        description: 'Modulo monitorear la fidelización de los comercios',
        icon: 'id-card-clip',
        route: '/FidelizacionCoordinador',
        roleAccess: [4]
      },
      {
        id: 2,
        title: 'Afilación',
        description: 'Quieres afiliar tu empresa con nuestro servicio de paquetes? manda una solicitud acá!.',
        icon: 'dumpster',
        route: '/afilacion',
        roleAccess: [5]
      },{
        id: 7,
        title: 'Módulo de Configuración',
        description: 'Configuración general de los datos de tu usuario.',
        icon: 'gear',
        route: '/Ajustes',
        roleAccess: [1, 2, 3,4,5]
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
