import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth'; // Asegúrate de que la ruta sea correcta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTable, // Icono para el título de la tabla
  faSearch,
  faCalendarCheck, // Icono para la acción Resolver
  faTimes, // Cerrar Modal
  faRoad
} from '@fortawesome/free-solid-svg-icons';

// Importación de componentes compartidos
import { Alert } from '../../../components/shared/alert/alert'; // Ajusta la ruta si es necesario
import { AlertType } from '../../../components/shared/alert/alert-type.type';
import { Table, TableColumn, TableAction } from '../../../components/shared/table/table'; // Ajusta la ruta si es necesario
import { Searchtable } from '../../../components/shared/searchtable/searchtable'; // Ajusta la ruta si es necesario
import { Modal } from '../../../components/shared/modal/modal'; 
// --- INTERFACES ---

interface Reporter {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
}

interface Incidence {
  id: number;
  guideId: number;
  reportedBy: Reporter;
  notes: string;
  reportedAt: string;
}

@Component({
  selector: 'app-incidencias',
  imports: [Alert, 
    CommonModule, 
    FormsModule, 
    FontAwesomeModule, 
    DatePipe, 
    DecimalPipe,
    Table,
    Searchtable, Modal ],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.css'
})
export class IncidenciaCoordinador implements OnInit {
  // Estado de la Alerta
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';

  // Data y Estado
  incidences: Incidence[] = [];
  filteredIncidences: Incidence[] = [];
  selectedIncidence: Incidence | null = null; 
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // Búsqueda y Filtrado
  searchTerm: string = '';

  // Modal de Resolución
  isResolveModalOpen: boolean = false;
  rescheduleDate: string = ''; 

  // Iconos
  faTable = faTable;
  faSearch = faSearch;
  faResolve = faCalendarCheck;
  faTimes = faTimes;
  faRoad = faRoad;

  // URLs de la API
  private incidencesApiUrl = 'http://147.135.215.156:8090/api/v1/incidences';
  private resolveIncidenceUrl = 'http://147.135.215.156:8090/api/v1/guides'; 

  // Configuración de la Tabla (para el componente app-table)
  tableColumns: TableColumn[] = [
    { key: 'guideId', header: 'Guía ID', type: 'text' },
    { key: 'reportedBy', header: 'Reportado Por', type: 'nested', nestedKey: 'firstname' },
    { key: 'reportedBy', header: 'Apellido', type: 'nested', nestedKey: 'lastname' },
    { key: 'notes', header: 'Descripción', type: 'text' },
    { key: 'reportedAt', header: 'Fecha Reporte', type: 'date', pipeFormat: 'dd/MM/yyyy - HH:mm' }
  ];

  tableActions: TableAction[] = [
    { 
      label: 'Resolver', 
      icon: this.faResolve, 
      action: 'resolve', 
      class: 'px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center text-xs' 
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadIncidences();
  }

  private getJsonHeaders(): HttpHeaders { 
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });
  }

  // --- Carga de Incidencias ---

  loadIncidences() {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<Incidence[]>(this.incidencesApiUrl, { headers: this.getJsonHeaders() }).subscribe({
      next: (response) => {
        this.incidences = response;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al cargar las incidencias.'
                );
        this.errorMessage = errors.join('. ');
        this.isLoading = false;
      }
    });
  }

  // --- Lógica de Filtrado (usando app-searchtable) ---

  onSearchChange(term: string) {
    this.searchTerm = term.toLowerCase();
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredIncidences = [...this.incidences];
      return;
    }
    
    this.filteredIncidences = this.incidences.filter(i => 
      String(i.guideId).includes(this.searchTerm) ||
      i.reportedBy.firstname.toLowerCase().includes(this.searchTerm) ||
      i.reportedBy.lastname.toLowerCase().includes(this.searchTerm) ||
      i.notes.toLowerCase().includes(this.searchTerm)
    );
  }

  // --- Lógica de Acciones de Tabla (desde app-table) ---

  onActionClick(event: { action: string, item: any }) {
    if (event.action === 'resolve') {
      this.openResolveModal(event.item as Incidence);
    }
  }

  // --- Modal de Resolución ---

  openResolveModal(incidence: Incidence) {
    this.selectedIncidence = incidence;
    // Inicializar la fecha con la fecha de hoy por defecto
    this.rescheduleDate = new Date().toISOString().substring(0, 10); 
    this.isResolveModalOpen = true;
  }

  closeResolveModal() {
    this.isResolveModalOpen = false;
    this.selectedIncidence = null;
    this.rescheduleDate = '';
  }

  submitResolution() {
    if (!this.selectedIncidence || !this.rescheduleDate) {
      this.showAlert('info', 'Debe seleccionar una fecha de reprogramación.');
      return;
    }

    const guideId = this.selectedIncidence.guideId;
    const payload = { rescheduleDate: this.rescheduleDate };
    const url = `${this.resolveIncidenceUrl}/${guideId}/resolve-incidence`;

    if (confirm(`¿Confirma resolver la incidencia de la guía #${guideId} y reprogramarla para el ${this.rescheduleDate}?`)) {
      this.http.post(url, payload, { headers: this.getJsonHeaders() }).subscribe({
        next: () => {
          this.showAlert('success', `Incidencia para la guía #${guideId} resuelta y reprogramada para el ${this.rescheduleDate} exitosamente.`);
          this.closeResolveModal();
          this.loadIncidences(); // Recargar la lista para que desaparezca la incidencia resuelta
        },
        error: (httpError) => {
          const errors: string[] = this.authService.extractErrorMessages(
            httpError, 
            'Error al resolver la incidencia. Por favor, intente de nuevo.'
          );
          this.showAlert('danger', errors);
        }
      });
    }
  }

  // --- Lógica de Alerts ---

  showAlert(type: AlertType, message: string | string[]): void {
    this.alertType = type;
    this.alertMessage = message;
    this.isAlertModalOpen = true;
    this.cdr.markForCheck();
  }
  closeAlertModal(): void {
    this.isAlertModalOpen = false;
    this.alertMessage = '';
  }
}
