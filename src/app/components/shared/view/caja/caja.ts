import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth'; // Ajusta la ruta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileInvoiceDollar, faArrowLeft, faPlus, faCheck, faStore, faTruck, faBan, faChartBar } from '@fortawesome/free-solid-svg-icons';

// Importar Shared Components (Ajusta las rutas)
import { Table, TableColumn, TableAction } from '../../table/table';
import { Alert } from '../../alert/alert';
import { AlertType } from '../../alert/alert-type.type';
import { Modal } from '../../modal/modal';

// --- Interfaces de Datos ---
interface CommerceDetail {
  id: number;
  nit: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  member: string;
  address: string;
  logo: string; 
  file: string;
}

interface MonthlyCashClosing {
  id: number;
  deliveriesTotalCount: number;
  deliveriesTotalAmount: number;
  deliveriesApplyPercentage: number;
  deliveriesSubTotalAmount: number;
  cancelledTotalCount: number;
  cancelledTotalAmount: number;
  cancelledApplyPercentage: number;
  cancelledSubTotalAmount: number;
  fidelizationLevel: string;
  totalAmount: number;
  commerce: CommerceDetail;
  status: string;
  createdDate: string;
}

interface PostClosingResponse {
  id: number;
  deliveriesTotalCount: number;
  deliveriesTotalAmount: number;
  deliveriesApplyPercentage: number;
  deliveriesSubTotalAmount: number;
  cancelledTotalCount: number;
  cancelledTotalAmount: number;
  cancelledApplyPercentage: number;
  cancelledSubTotalAmount: number;
  fidelizationLevel: string;
  totalAmount: number;
  status: string;
  createdDate: string;
}


@Component({
  selector: 'app-caja',
  imports: [CommonModule, FontAwesomeModule, DatePipe, DecimalPipe, Table, Alert, Modal],
  templateUrl: './caja.html',
  styleUrl: './caja.css'
})
export class Caja  implements OnInit {

  // --- Inputs ---
  @Input() userId: number | undefined; // ID del comercio (si es comercio o admin viendo detalle)
  @Input() esComercio: boolean = false; // Indica si la vista es desde el panel de comercio
  
  // --- URLs de API ---
  private apiUrlGeneral = 'http://147.135.215.156:8090/api/v1/monthly-cash-closing';

  // --- Estados de Datos ---
  closings: MonthlyCashClosing[] = [];
  selectedClosing: MonthlyCashClosing | null = null; 
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // --- Lógica de Vistas/Modal/Alerta ---
  viewMode: 'table' | 'invoice' = 'table'; 
  isConfirmModalOpen: boolean = false;
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';

  // --- Íconos ---
  faFileInvoiceDollar = faFileInvoiceDollar;
  faArrowLeft = faArrowLeft;
  faPlus = faPlus;
  faCheck = faCheck;
  faStore = faStore;
  faTruck = faTruck;
  faBan = faBan;
  faChartBar = faChartBar;

  // --- Configuración de Tabla ---
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.configureTable();
    this.loadCashClosings();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  private configureTable() {
    // Columnas base para la vista de tabla
    this.tableColumns = [
      { key: 'id', header: 'ID', type: 'text' },
      { key: 'createdDate', header: 'Fecha Cierre', type: 'date', pipeFormat: 'mediumDate' },
      { key: 'totalAmount', header: 'Monto Total', type: 'currency', pipeFormat: '1.2-2' },
      { key: 'status', header: 'Estado', type: 'text' },
    ];

    // Si es ADMIN (no esComercio), añadir columnas de Comercio
    if (!this.esComercio) {
      this.tableColumns.splice(1, 0, 
        { key: 'commerce.name', header: 'Comercio', type: 'nested', nestedKey: 'name' }
      );
      this.tableColumns.push(
        { key: 'commerce.logo', header: 'Logo', type: 'custom' } // 'custom' para renderizado especial
      );
      
      this.tableActions = [{ 
        label: 'Ver Factura', 
        icon: this.faFileInvoiceDollar, 
        action: 'viewCajaDetail', 
        class: 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors' 
      }];
    }
  }

  loadCashClosings() {
    this.isLoading = true;
    this.errorMessage = null;
    let url = this.apiUrlGeneral;

    if (this.userId) {
      // Si hay un ID de usuario, usa la ruta específica
      url = `${this.apiUrlGeneral}/${this.userId}`;
    }

    this.http.get<MonthlyCashClosing[]>(url, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.isLoading = false;
        
        if (this.userId) {
            // Caso de comercio o admin viendo el detalle de un ID específico
            if (data.length > 0) {
                this.selectedClosing = data[0]; // Asume que se devuelve el último o el único relevante
                this.viewMode = 'invoice';
            } else {
                this.errorMessage = 'No se encontró un cierre de caja para este usuario.';
            }
        } else {
            // Caso de admin viendo la lista general
            this.closings = data;
            this.viewMode = 'table';
        }
        this.cdr.markForCheck();
      },
      error: (httpError) => {
        this.isLoading = false;
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al cargar cierres de caja. Por favor, intente de nuevo.'
                );
        this.showAlert('danger', errors);
        this.cdr.markForCheck();
      }
    });
  }
  
  // --- Acciones de Comercio (POST) ---

  openCreateConfirmationModal() {
    this.isConfirmModalOpen = true;
  }
  
  closeConfirmModal() {
    this.isConfirmModalOpen = false;
  }

  createCashClosing() {
    this.closeConfirmModal(); 
    this.isLoading = true;
    this.errorMessage = null;

    this.http.post<PostClosingResponse>(this.apiUrlGeneral, {}, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        this.isLoading = false;
        const successMessages: string[] = [
            '¡Cierre de caja creado exitosamente!',
            `ID Cierre: ${response.id}`,
            `Monto Total: $${response.totalAmount.toFixed(2)}`,
            `Estado: ${response.status}`
        ];
        this.showAlert('success', successMessages);
        this.loadCashClosings(); // Recargar para mostrar el nuevo cierre en la factura
        this.cdr.markForCheck();
      },
      error: (httpError) => {
        this.isLoading = false;
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al intentar crear el cierre de caja. Por favor, intente de nuevo.'
                );
        this.showAlert('danger', errors);
        this.cdr.markForCheck();
      }
    });
  }

  // --- Manejo de Vistas y Alertas ---
  
  goBackToTable() {
    this.selectedClosing = null;
    this.viewMode = 'table';
    this.loadCashClosings(); // Recargar la lista general
  }

  handleTableAction(event: { action: string, item: any }) {
    if (event.action === 'viewCajaDetail') {
      this.selectedClosing = event.item as MonthlyCashClosing;
      this.viewMode = 'invoice';
    }
  }
  
  showAlert(type: AlertType, message: string | string[]): void {
    this.alertType = type;
    this.alertMessage = message;
    this.isAlertModalOpen = true;
    this.cdr.markForCheck();
  }

  closeAlertModal(): void {
    this.isAlertModalOpen = false;
  }
}
