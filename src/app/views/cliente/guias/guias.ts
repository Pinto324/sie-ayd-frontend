import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
// Asegúrate de que esta ruta sea correcta para tu servicio de autenticación
import { AuthService } from '../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faSearch, faArrowLeft, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Alert } from '../../../components/shared/alert/alert';
import { AlertType } from '../../../components/shared/alert/alert-type.type'; 
// Importar componentes compartidos
import { Searchtable } from '../../../components/shared/searchtable/searchtable';
import { Table, TableColumn, TableAction } from '../../../components/shared/table/table';
// Importar el componente de detalle (asumiendo que la ruta es correcta)
import { Guiadetalle } from '../../../components/shared/guiadetalle/guiadetalle';

// --- Interfaces de Datos ---
interface Commerce { name: string; }
interface Status { name: string; }
interface PackageType { name: string; }
interface Guide {
  id: number;
  code: string;
  commerce: Commerce;
  recipient: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  price: number;
  status: Status;
  type: PackageType;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-guias',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, Searchtable, Table, Guiadetalle,FormsModule, Alert ],
  templateUrl: './guias.html',
  styleUrl: './guias.css'
})
export class GuiasCliente implements OnInit {
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  // Datos y Estados
  guides: Guide[] = [];
  filteredGuides: Guide[] = [];
  searchTerm: string = '';
  isLoadingData: boolean = true;
  guideinfo = "";
  guidename = "";
  userRoleId: number | null | undefined;
  isRejectModalOpen: boolean = false;
  rejectionGuideId: number | null = null;
  rejectionNotes: string = '';
  // Control de Vista
  showDetailView: boolean = false; // TRUE: Muestra el detalle; FALSE: Muestra la tabla
  selectedGuideCode: string | null = null; // Código de la guía a mostrar en el detalle

  // Íconos
  faSearch = faSearch;
  faEye = faEye;
  faArrowLeft = faArrowLeft;
   faTimes = faTimes; // Reutilizado para cerrar el modal
  faReject = faTimesCircle;

  // Endpoint API
  private guidesApiUrl = 'http://147.135.215.156:8090/api/v1/guides';
  private rejectGuideUrl = 'http://147.135.215.156:8090/api/v1/guides';
  // --- Configuración para TablaComponent ---
  tableColumns: TableColumn[] = [
    { key: 'code', header: 'Código', type: 'text' },
    { 
    key: 'commerce', 
    header: 'Comercio', 
    type: 'nested', 
    nestedKey: 'name'  // Esto debería funcionar para commerce.name
  },
    { key: 'recipient', header: 'Destinatario', type: 'text' },
    { key: 'address', header: 'Dirección', type: 'text' },
    { key: 'status', header: 'Estado', type: 'nested', nestedKey: 'name' },
    { key: 'createdAt', header: 'Fecha Creada', type: 'date' },
  ];
  tableActions: TableAction[] = [
  {
    label: 'Ver Detalle',
    icon: faEye,
    action: 'view_detail',
    class: 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors'
  },
  {
    label: 'Rechazar Entrega',
    icon: faTimesCircle,
    action: 'reject_delivery',
    class: 'px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors',
    condition: () => this.userRoleId === 5   // 👈 se evalúa por fila
  }
];
  // ----------------------------------------

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private alertService: Alert ,
  ) { }

  ngOnInit() {
    this.userRoleId = this.authService.getRoleId();
    
    switch (this.userRoleId) { 
      case 1:
      case 4:
        this.guideinfo = "Información y el estado de los paquetes"
        this.guidename = "Modulo de paquetes"
        break;
      case 5:
        this.guideinfo = "Consulta el estado y los detalles de tus envíos."
        this.guidename = "Mis Paquetes de Envío"
        break;
      default:
        break;
    }
    this.loadGuides();
  }

  private getHeaders(): HttpHeaders {
    // La API de listado (guides) requiere autenticación
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // --- Carga de Datos y Búsqueda ---

  loadGuides() {
    this.isLoadingData = true;
    const headers = this.getHeaders();
    this.http.get<Guide[]>(this.guidesApiUrl, { headers }).subscribe({
      next: (response) => {
        this.guides = response;
        console.log(response);
        this.searchGuides(this.searchTerm);
        this.isLoadingData = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading guides:', error);
        this.isLoadingData = false;
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchGuides(term);
  }

  searchGuides(term: string) {
    if (!term) {
      this.filteredGuides = this.guides;
      return;
    }

    const lowerCaseTerm = term.toLowerCase();
    this.filteredGuides = this.guides.filter(guide =>
      guide.code.toLowerCase().includes(lowerCaseTerm) ||
      guide.recipient.toLowerCase().includes(lowerCaseTerm) ||
      guide.commerce.name.toLowerCase().includes(lowerCaseTerm)
    );
  }

  // --- Control de Vistas ---

 handleTableAction(event: { action: string, item: Guide }): void {
    const guide = event.item;
    if (event.action === 'view_detail') {
      this.openDetailView(guide.code);
    } else if (event.action === 'reject_delivery') {
      // Verificar las condiciones: Rol Cliente (5) y Estado "Entregada"
      const isClient = this.userRoleId === 5;
      const isDelivered = guide.status.name === 'Entregada';

      if (isClient && isDelivered) {
        this.openRejectModal(guide.id);
      } else {
        // Opcional: Notificar por qué no está disponible
        this.showAlert('info', 'La opción "Rechazar Entrega" solo está disponible para el Cliente en guías con estado "Entregada".');
      }
    }
  }
   // --- Lógica del Modal de Rechazo ---

  openRejectModal(guideId: number) {
    this.rejectionGuideId = guideId;
    this.rejectionNotes = ''; // Limpiar notas previas
    this.isRejectModalOpen = true;
  }

  closeRejectModal() {
    this.isRejectModalOpen = false;
    this.rejectionGuideId = null;
    this.rejectionNotes = '';
  }

  rejectDelivery() {
    if (!this.rejectionGuideId || this.rejectionNotes.trim() === '') {
      this.showAlert('info', 'La razón de rechazo es obligatoria.');
      return;
    }

    const id = this.rejectionGuideId;
    const payload = { notes: this.rejectionNotes };
    const headers = this.getHeaders();
    
    // Ruta final: http://.../guides/:id/reject
    this.http.post(`${this.rejectGuideUrl}/${id}/reject`, payload, { headers }).subscribe({
      next: () => {
        this.showAlert('success', 'La entrega ha sido rechazada exitosamente. Su guía será procesada como devolución.');
        this.closeRejectModal();
        this.loadGuides(); // Recargar la lista para que se actualice el estado
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

  /**
   * Oculta la tabla y muestra la vista de detalle.
   */
  openDetailView(code: string) {
    this.selectedGuideCode = code;
    this.showDetailView = true;
  }

  /**
   * Oculta la vista de detalle y vuelve a mostrar la tabla.
   */
  goBackToTable() {
    this.showDetailView = false;
    this.selectedGuideCode = null;
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
