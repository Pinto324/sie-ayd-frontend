import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth'; 
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faUserTie,    
  faBan,         
  faDice,        
  faArrowLeft,    
  faEye,         
  faTimes      
} from '@fortawesome/free-solid-svg-icons';
import { Filtroseleccion } from '../../../components/shared/filtroseleccion/filtroseleccion'; 
import { FilterOption } from '../../../interfaces/filter-option.interface';  
import { Alert } from '../../../components/shared/alert/alert';
import { AlertType } from '../../../components/shared/alert/alert-type.type';
interface Status { id: number; name: string; description: string; }
interface PackageType { id: number; name: string; description: string; basePrice: number; }
interface AssignedBy { id: number; firstname: string; lastname: string; email: string; phoneNumber: string; }
interface Commerce { id: number; nit: string; name: string; email: string; phoneNumber: string; createdAt: string; member: string; address: string; logo: string; file: string; }

interface SimpleEmployee { id: number; dni: number; userId: number; email: string; firstname: string; lastname: string; phoneNumber: string; }


interface Guide { 
  id: number; code: string; commerce: Commerce; recipient: string; address: string; phone: string; email: string; description: string; price: number; status: Status; type: PackageType; createdAt: string; updatedAt: string; requestsCount: number; assignedTo: SimpleEmployee; 
}

interface Assignment { 
  id: number; guide: Guide; employee: SimpleEmployee; assignedBy: AssignedBy; notes: string; createdAt: string; acceptedAt: string; status: 'PENDING' | 'ACCEPTED' | 'CANCELLED'; 
}

interface AvailableDeliveryPerson { userId: number; employeeId: number; dni: string; firstname: string; lastname: string; contractId: number; available: boolean; }
interface AvailablePersonnelResponse { content: AvailableDeliveryPerson[]; page: number; size: number; totalElements: number; totalPages: number; }

interface ContractDetail { id: number; contractType: string; baseSalary: number; commissionPercentage: number; endDate: string; startDate: string; contractStatus: string; }
interface DeliveryPersonDetail { 
  id: number; userId: number; firstname: string; lastname: string; phoneNumber: string; email: string; dni: string; birthDate: string; address: string; emergencyContact: string; contract: ContractDetail; createdAt: string; 
}
@Component({
  selector: 'app-asignacion',
  imports: [CommonModule, FormsModule, FontAwesomeModule, DatePipe, DecimalPipe, Alert,Filtroseleccion],
  templateUrl: './asignacion.html',
  styleUrl: './asignacion.css'
})
export class AsignacionCoordinador implements OnInit {
   viewMode: 'pending_guides' | 'all_assignments' | 'available_personnel' = 'pending_guides';
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  // Reemplazar las opciones de filtro existentes por las del componente compartido
  filterOptions: FilterOption[] = [
    { value: 'pending_guides', label: 'Guías Pendientes', iconClass: 'fas fa-box' },
    { value: 'all_assignments', label: 'Guías Asignadas', iconClass: 'fas fa-truck-fast' },
  ];
  pendingGuides: Guide[] = []; 
  allAssignments: Assignment[] = [];
  availablePersonnel: AvailableDeliveryPerson[] = [];
  
  selectedGuideId: number | null = null;
  notes: string = '';
  
  isPersonnelModalOpen: boolean = false;
  selectedPersonnelDetail: DeliveryPersonDetail | null = null;

  isLoadingAssignments: boolean = true;
  isLoadingPersonnel: boolean = false;
  isAssigning: boolean = false;
  errorMessage: string | null = null;

  // Iconos
  faSearch = faSearch;
  faAssign = faUserTie;
  faCancel = faBan;
  faRandom = faDice;
  faBack = faArrowLeft;
  faDetails = faEye;
  faTimes = faTimes;

  // URLs de la API
  private guidesApiUrl = 'http://147.135.215.156:8090/api/v1/guides';
  private assignmentsApiUrl = 'http://147.135.215.156:8090/api/v1/assignments';
  private cancelAssignmentUrl = 'http://147.135.215.156:8090/api/v1/assignments/cancel';
  private availablePersonnelApiUrl = 'http://147.135.215.156:8090/api/v1/delivery-person/available?page=0&size=10000';
  private assignManualUrl = 'http://147.135.215.156:8090/api/v1/assignments';
  private assignRandomUrl = 'http://147.135.215.156:8090/api/v1/assignments/random';
  private personnelDetailUrl = 'http://147.135.215.156:8090/api/v1/delivery-person';


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPendingGuides(); // Cargar la vista por defecto
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // --- Lógica de Vistas (Pestañas) ---

  switchTab(tab: 'pending_guides' | 'all_assignments') {
    this.viewMode = tab;
    this.errorMessage = null;
    this.isLoadingAssignments = true;

    if (tab === 'pending_guides') {
      this.loadPendingGuides();
    } else {
      this.loadAllAssignments();
    }
  }

  loadPendingGuides() {
    this.isLoadingAssignments = true;
    this.http.get<Guide[]>(this.guidesApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        // Filtrar solo las guías cuyo status.name sea "Creada"
        this.pendingGuides = response.filter(g => g.status.name === 'Creada');
        this.isLoadingAssignments = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar guías pendientes:', error);
        this.errorMessage = 'Error al cargar guías pendientes.';
        this.isLoadingAssignments = false;
      }
    });
  }

  loadAllAssignments() {
    this.isLoadingAssignments = true;
    this.http.get<Assignment[]>(this.assignmentsApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        // Ordenar: PENDING primero para destacarlas
        this.allAssignments = response.sort((a, b) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
            return 0;
        });
        this.isLoadingAssignments = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar todas las asignaciones:', error);
        this.errorMessage = 'Error al cargar todas las asignaciones.';
        this.isLoadingAssignments = false;
      }
    });
  }

  // --- Lógica de Flujo de Asignación ---

  openPersonnelView(guideId: number) {
    this.selectedGuideId = guideId;
    this.notes = ''; // Resetear notas
    this.viewMode = 'available_personnel';
    this.loadAvailablePersonnel();
  }

  goBack() {
    this.selectedGuideId = null;
    this.notes = '';
    // Volver a la vista de guías pendientes después de una asignación
    this.viewMode = 'pending_guides';
    this.availablePersonnel = [];
    this.loadPendingGuides(); // Recarga la lista de guías pendientes
  }

  loadAvailablePersonnel() {
    this.isLoadingPersonnel = true;
    this.http.get<AvailablePersonnelResponse>(this.availablePersonnelApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        this.availablePersonnel = response.content;
        this.isLoadingPersonnel = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar personal disponible:', error);
        this.errorMessage = 'Error al cargar personal disponible.';
        this.isLoadingPersonnel = false;
      }
    });
  }

  assignToPersonnel(employeeUserId: number) {
    if (!this.selectedGuideId || this.isAssigning) return;

    this.isAssigning = true;
    const payload = {
      guideId: this.selectedGuideId,
      employeeUserId: employeeUserId,
      notes: this.notes
    };

    this.http.post(this.assignManualUrl, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.showAlert('success', 'Guía asignada exitosamente.');
        this.isAssigning = false;
        this.goBack(); // Volver a la vista principal (Guías Pendientes)
      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al crear empleado. Por favor, intente de nuevo.' // Mensaje por defecto
                );
            this.showAlert('danger', errors);
        this.isAssigning = false;
      }
    });
  }

  assignRandomly() {
    if (!this.selectedGuideId || this.isAssigning) return;

    if (confirm('¿Asignar esta guía de forma aleatoria?')) {
      this.isAssigning = true;
      const payload = {
        guideId: this.selectedGuideId,
        notes: this.notes
      };

      this.http.post(this.assignRandomUrl, payload, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.showAlert('success', 'Guía asignada exitosamente.');
          this.isAssigning = false;
          this.goBack(); // Volver a la vista principal (Guías Pendientes)
        },
        error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al crear empleado. Por favor, intente de nuevo.' // Mensaje por defecto
                );
            this.showAlert('danger', errors);
          this.isAssigning = false;
        }
      });
    }
  }
  
  // --- Lógica de Cancelación y Detalles ---

  cancelAssignment(assignmentId: number) {
    if (confirm('¿Estás seguro de que quieres cancelar esta asignación?')) {
      this.http.post(`${this.cancelAssignmentUrl}/${assignmentId}`, {}, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.showAlert('success', 'Asignación cancelada exitosamente.');
          this.loadAllAssignments(); // Recarga la tabla de todas las asignaciones
        },
        error: (error) => {
          console.error('Error al cancelar la asignación:', error);
          alert('Error al cancelar la asignación. Verifique la consola.');
        }
      });
    }
  }

  showPersonnelDetails(employeeId: number) {
    this.selectedPersonnelDetail = null;
    this.isPersonnelModalOpen = true;

    this.http.get<DeliveryPersonDetail>(`${this.personnelDetailUrl}/${employeeId}`, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        this.selectedPersonnelDetail = response;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar detalles del repartidor:', error);
        alert('Error al cargar detalles del repartidor.');
        this.closePersonnelModal();
      }
    });
  }
 onFilterChange(selectedFilter: string): void {
    this.viewMode = selectedFilter as 'pending_guides' | 'all_assignments';
    this.errorMessage = null;
    this.isLoadingAssignments = true;

    if (this.viewMode === 'pending_guides') {
      this.loadPendingGuides();
    } else {
      this.loadAllAssignments();
    }
  }
  closePersonnelModal() {
    this.isPersonnelModalOpen = false;
    this.selectedPersonnelDetail = null;
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
