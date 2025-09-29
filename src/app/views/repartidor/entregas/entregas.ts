import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../../services/auth'; // Asegúrate de que la ruta sea correcta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faEye,          // Detalles
  faArrowLeft,    // Volver
  faBoxOpen,      // Recolectada
  faTruckFast,    // En Transito
  faCheckDouble,  // Finalizar Entrega
  faTimes         // Cerrar Modal
} from '@fortawesome/free-solid-svg-icons';
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

@Component({
  selector: 'app-entregas',
  imports: [Alert, CommonModule, FormsModule, FontAwesomeModule, DatePipe, DecimalPipe],
  templateUrl: './entregas.html',
  styleUrl: './entregas.css'
})
export class EntregasRepartidor implements OnInit {
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  // Estado de la Vista Principal
  viewMode: 'table' | 'detail' = 'table';
  
  // Data
  assignments: Assignment[] = [];
  selectedAssignment: Assignment | null = null; // Para la vista de detalle
  
  // Estados de carga y error
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Modal de Finalización de Entrega (Status 4)
  isDeliveryModalOpen: boolean = false;
  deliveryNotes: string = '';
   deliveryFiles: (File | null)[] = [null, null, null]; // 3 espacios para URLs/Base64

  // Iconos
  faSearch = faSearch;
  faDetails = faEye;
  faBack = faArrowLeft;
  faCollected = faBoxOpen;
  faInTransit = faTruckFast;
  faDelivered = faCheckDouble;
  faTimes = faTimes;


  // URLs de la API
  private assignmentsApiUrl = 'http://147.135.215.156:8090/api/v1/assignments?status=ACCEPTED';
  private guideWorkUrl = 'http://147.135.215.156:8090/api/v1/guides/work'; // PUT para status 2 y 3
  private guideDeliverUrl = 'http://147.135.215.156:8090/api/v1/guides/deliver'; // POST para status 4


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAssignments();
  }

private getJsonHeaders(): HttpHeaders { 
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });
  }

private getFormDataHeaders(): HttpHeaders {
  const token = this.authService.getToken();
  // IMPORTANTE: No establecer Content-Type manualmente
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`
    // ELIMINA completamente 'Content-Type'
  });
}

  // --- Carga de Asignaciones ACEPTADAS ---

  loadAssignments() {
    this.viewMode = 'table';
    this.isLoading = true;
    this.errorMessage = null;
    let params = new HttpParams().set('status', 'ACCEPTED'); 
    this.http.get<Assignment[]>(this.assignmentsApiUrl, { headers: this.getJsonHeaders(), params: params }).subscribe({
      next: (response) => {
        // Filtrar guías con ID de estado relevante (2, 3, 4) para el flujo de trabajo del repartidor
        this.assignments = response.filter(a => [2, 3, 4].includes(a.guide.status.id));
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las asignaciones aceptadas.';
        this.isLoading = false;
      }
    });
  }

  // --- Lógica de Vistas ---

  openDetailView(assignment: Assignment) {
    this.selectedAssignment = assignment;
    this.viewMode = 'detail';
  }

  goBackToTable() {
    this.selectedAssignment = null;
    this.viewMode = 'table';
    this.loadAssignments(); // Recargar para actualizar estados
  }

  // --- Lógica de Avance de Estado (Recolectada / En Tránsito) ---

  handleWorkStatus(assignment: Assignment) {
    const currentStatusId = assignment.guide.status.id;
    let actionText = '';
    let newStatusId: number | null = null;
    if (currentStatusId === 2) {
       newStatusId = 3; 
      actionText = 'Recolectada';
    } else if (currentStatusId === 3) {
      newStatusId = 4; 
      actionText = 'En Ruta';
    } else {
      return; // No hay acción de trabajo definida para este estado
    }
    const payload = { statusId: newStatusId };
    if (confirm(`¿Confirmas cambiar el estado de la guía #${assignment.guide.code} a "${actionText}"?`)) {
       this.http.put(`${this.guideWorkUrl}/${assignment.guide.id}`, payload, { headers: this.getJsonHeaders() }).subscribe({
        next: () => {
          this.showAlert('success', `Guía #${assignment.guide.code} actualizada a "${actionText}" exitosamente.`);
          if (this.viewMode === 'detail') {
              this.goBackToTable(); // Volver a la tabla y recargar
          } else {
              this.loadAssignments(); // Recargar solo la tabla
          }
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
  }

  // --- Lógica de Finalización de Entrega (Status 4) ---

  openDeliveryModal(assignment: Assignment) {
    this.selectedAssignment = assignment;
    this.deliveryNotes = assignment.notes || ''; // Inicializar con notas existentes
    this.deliveryFiles = [null, null, null]; 
    this.isDeliveryModalOpen = true;
  }

  closeDeliveryModal() {
    this.isDeliveryModalOpen = false;
    this.selectedAssignment = null;
    this.deliveryNotes = '';
    this.deliveryFiles = [null, null, null]; 
  }
  
onFileSelected(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.deliveryFiles[index] = input.files[0];
    console.log(`Archivo ${index + 1} seleccionado:`, input.files[0].name);
  } else {
    this.deliveryFiles[index] = null;
  }
  // Forzar detección de cambios
  this.cdr.detectChanges();
}
  isFileInputValid(): boolean {
    return this.deliveryFiles.some(file => file !== null);
  }

submitDelivery() {
  if (!this.selectedAssignment) return;

  const filesToSend = this.deliveryFiles.filter(file => file !== null) as File[];

  if (filesToSend.length === 0) {
    alert('Debe adjuntar al menos 1 imagen para finalizar la entrega.');
    return;
  }

  // Crear FormData con la estructura EXACTA que espera el backend
  const formData = new FormData();
  const guideId = this.selectedAssignment.guide.id;

  // 1. Añadir el objeto 'data' como BLOB (igual que en el ejemplo)
  const dataPayload = {
    guideId: guideId,
    notes: this.deliveryNotes
  };
  
  // USAR BLOB como en el ejemplo que te enviaron
  formData.append('data', new Blob([JSON.stringify(dataPayload)], { 
    type: 'application/json' 
  }));
  
  // 2. Añadir los archivos - usa el mismo patrón
  filesToSend.forEach((file, index) => {
    // Según el ejemplo, usa 'imgs' para las imágenes
    formData.append('img', file, file.name);
  });

  // Debug: verificar lo que se envía
  this.logFormData(formData);

  if (confirm(`¿Confirma finalizar la entrega de la guía #${this.selectedAssignment.guide.code}?`)) {
    this.http.post(this.guideDeliverUrl, formData, { 
      headers: this.getFormDataHeaders() 
    }).subscribe({
      next: (response) => {
        this.showAlert('success', `Entrega marcada como finalizada correctamente`);
        this.closeDeliveryModal();
        this.loadAssignments();
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
}

// Método auxiliar para debuggear FormData
private logFormData(formData: FormData) {
  console.log('=== FormData Contents ===');
  for (let pair of formData.entries()) {
    const key = pair[0];
    const value = pair[1];
    if (value instanceof File) {
      console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
    } else {
      console.log(`${key}:`, value);
      // Si es el campo 'data', también muestra el objeto parseado
      if (key === 'data') {
        try {
          console.log(`${key} (parsed):`, JSON.parse(value as string));
        } catch (e) {
          console.log(`${key} (parse error):`, e);
        }
      }
    }
  }
}
        //manejo alert:
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