import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth'; // Asegúrate de que la ruta sea correcta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faCheck,        // Aceptar
  faTimes,        // Rechazar / Cerrar Modal
  faEye,          // Detalles
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from '../../../components/shared/alert/alert';
import { AlertType } from '../../../components/shared/alert/alert-type.type';
// --- Interfaces de datos (Reutilizadas y adaptadas) ---

interface Status { id: number; name: string; description: string; }
interface PackageType { id: number; name: string; description: string; basePrice: number; }
interface AssignedBy { id: number; firstname: string; lastname: string; email: string; phoneNumber: string; }
interface Commerce { id: number; nit: string; name: string; email: string; phoneNumber: string; createdAt: string; member: string; address: string; logo: string; file: string; }
interface SimpleEmployee { id: number; dni: number; userId: number; email: string; firstname: string; lastname: string; phoneNumber: string; }

interface Guide { 
  id: number; code: string; commerce: Commerce; recipient: string; address: string; phone: string; email: string; description: string; price: number; status: Status; type: PackageType; createdAt: string; updatedAt: string; requestsCount: number; assignedTo: SimpleEmployee; 
}

// Interfaz para la asignación
interface Assignment { 
  id: number; guide: Guide; employee: SimpleEmployee; assignedBy: AssignedBy; notes: string; createdAt: string; acceptedAt: string; status: 'PENDING' | 'ACCEPTED' | 'CANCELLED'; 
}
@Component({
  selector: 'app-asignacion',
  imports: [CommonModule, FormsModule, FontAwesomeModule,Alert, DecimalPipe],
  templateUrl: './asignacion.html',
  styleUrl: './asignacion.css'
})
export class AsignacionRepartidor implements OnInit {
  
  // Data
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  
  // Filtro
  searchTerm: string = '';
  
  // Estados de carga y error
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Estado del Modal de Detalles
  isDetailModalOpen: boolean = false;
  selectedAssignmentDetail: Assignment | null = null;
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  // Iconos
  faSearch = faSearch;
  faAccept = faCheck;
  faReject = faTimes;
  faDetails = faEye;

  // URLs de la API
  private assignmentsApiUrl = 'http://147.135.215.156:8090/api/v1/assignments';
  private acceptAssignmentUrl = 'http://147.135.215.156:8090/api/v1/assignments/accept';
  private rejectAssignmentUrl = 'http://147.135.215.156:8090/api/v1/assignments/reject';


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAssignments();
  }

  private getHeaders(): HttpHeaders {
    // Nota: Asumiendo que el endpoint de assignments ya filtra por el repartidor autenticado
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // --- Carga y Filtrado de Asignaciones ---

  loadAssignments() {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<Assignment[]>(this.assignmentsApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        this.assignments = response;
        this.filterAssignments(this.searchTerm); // Aplicar filtro inicial (vacío)
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las asignaciones.';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.filterAssignments(term);
  }

  filterAssignments(term: string) {
    if (!term) {
      this.filteredAssignments = this.assignments;
      return;
    }

    const lowerCaseTerm = term.toLowerCase();
    this.filteredAssignments = this.assignments.filter(assignment =>
      assignment.guide.code.toLowerCase().includes(lowerCaseTerm) ||
      assignment.guide.commerce.name.toLowerCase().includes(lowerCaseTerm) ||
      assignment.guide.recipient.toLowerCase().includes(lowerCaseTerm) ||
      assignment.status.toLowerCase().includes(lowerCaseTerm)
    );
  }

  // --- Lógica de Acciones ---

  acceptAssignment(assignmentId: number) {
    if (confirm('¿Confirmas que deseas ACEPTAR esta asignación?')) {
      this.performAction(assignmentId, this.acceptAssignmentUrl, 'aceptada');
    }
  }

  rejectAssignment(assignmentId: number) {
    if (confirm('¿Confirmas que deseas RECHAZAR esta asignación?')) {
      this.performAction(assignmentId, this.rejectAssignmentUrl, 'rechazada');
    }
  }

  private performAction(assignmentId: number, url: string, actionName: string) {
    // Lógica para enviar la acción POST
    this.http.post(`${url}/${assignmentId}`, {}, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.showAlert('success', `Asignación ${actionName} exitosamente.`);
        this.loadAssignments(); // Recargar la tabla para reflejar el cambio
      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al crear empleado. Por favor, intente de nuevo.' // Mensaje por defecto
                );
            this.showAlert('danger', errors);
      }
    });
  }

  // --- Lógica del Modal de Detalles ---

  openDetailModal(assignment: Assignment) {
    this.selectedAssignmentDetail = assignment;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedAssignmentDetail = null;
  }
      //manejo modal:
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
