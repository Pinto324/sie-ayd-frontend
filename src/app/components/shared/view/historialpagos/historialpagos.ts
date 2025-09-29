import { Component, OnInit, Input, ChangeDetectorRef, EventEmitter,OnChanges,Output  } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth'; // Ajusta la ruta a tu AuthService
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileInvoiceDollar, faSearch, faArrowLeft,faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
// Importar Shared Components (Asegúrate de que las rutas sean correctas)
import { Table, TableColumn } from '../../table/table';
import { Alert } from '../../alert/alert';
import { AlertType } from '../..//alert/alert-type.type';
import { Searchtable } from '../../searchtable/searchtable';
import { Modal } from '../../modal/modal';
// --- Interfaces de Datos ---
interface UserDetail {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
}

interface Payment {
  paymentId: number;
  referenceCode: string;
  user: UserDetail;
  amount: number;
  paymentMethod: string;
  status: string;
  paymentDate: string;
  comment: string;
}
interface ContractDetail {
  id: number;
  contractType: string; // Ej: FIJO, POR_HORAS
  baseSalary: number;
  commissionPercentage: number;
  endDate: string; // "YYYY-MM-DD"
  startDate: string; // "YYYY-MM-DD"
  contractStatus: string; // Ej: ACTIVO, VENCIDO
}

interface DeliveryPersonDetail {
  id: number;
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  dni: string;
  contract: ContractDetail;
  commissions: number;
  settlementDate: string; // "YYYY-MM-DD"
  hours: number; // en minutos
}

@Component({
  selector: 'app-historialpagos',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, Table, Searchtable, Alert,Modal],
  templateUrl: './historialpagos.html',
  styleUrl: './historialpagos.css'
})
export class Historialpagos implements OnInit {
  
  /**
   * ID del usuario para filtrar el historial.
   * Si es `undefined` (no se pasa), se asume que es un Administrador y se traen todos.
   */
  @Input() userId: number | undefined; 
  @Input() idEmpleado: number | undefined; 
  // --- Estados de Datos y UI ---
  payments: Payment[] = [];
  deliveryPerson: DeliveryPersonDetail | null = null;
  filteredPayments: Payment[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  searchTerm: string = '';
isAdmin: boolean = false;
  isPaymentModalOpen: boolean = false;
  totalPayable: number = 0;

    isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  @Input() isUserView: boolean = false;
  @Input() isAdminUserSpecific: boolean = false;
  @Output() back = new EventEmitter<void>();
  onBackClick() {
    this.back.emit();
  }
  // --- Configuración API ---
 private baseUrl = 'http://147.135.215.156:8090/api/v1/payments/historial';
  private deliveryPersonApiUrl = 'http://147.135.215.156:8090/api/v1/delivery-person';
  private paymentApiUrl = 'http://147.135.215.156:8090/api/v1/payments';


  // --- Íconos y Configuración de Tabla ---
  faFileInvoiceDollar = faFileInvoiceDollar;
  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faMoneyBillWave = faMoneyBillWave; 
  tableColumns: TableColumn[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.configureTableColumns();
  }

ngOnInit() {
    this.checkUserRole();
    this.loadPayments();
    if (this.idEmpleado !== undefined && this.isAdmin) {
      this.loadDeliveryPersonData(this.idEmpleado);
    }
  }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Configura las columnas de la tabla. 
   * La vista de Admin necesita columnas para el nombre del repartidor.
   */
  private configureTableColumns() {
    // Columnas comunes para ambos roles
    const commonColumns: TableColumn[] = [
      { key: 'referenceCode', header: 'Referencia', type: 'text' },
      { key: 'paymentMethod', header: 'Método de Pago', type: 'text' },
      { key: 'amount', header: 'Monto', type: 'currency', pipeFormat: '1.2-2' },
      { key: 'status', header: 'Estado', type: 'text' },
      { key: 'paymentDate', header: 'Fecha', type: 'date', pipeFormat: 'dd/MM/yyyy - HH:mm'  },
    ];
    
    // Si NO se recibe userId, es el Admin, se añaden las columnas del Repartidor (anidadas en 'user')
    if (this.userId === undefined) {
      const userColumns: TableColumn[] = [
        // Usamos 'nested' para acceder a las propiedades del objeto 'user'
        { key: 'user', header: 'Nombre Repartidor', type: 'nested', nestedKey: 'firstname' },
        { key: 'user', header: 'Apellido Repartidor', type: 'nested', nestedKey: 'lastname' },
      ];
      this.tableColumns = [...userColumns, ...commonColumns];
    } else {
      // Si es el Repartidor, solo se muestran las columnas comunes
      this.tableColumns = commonColumns;
    }
  }

  /**
   * Determina la URL de la API y carga los datos.
   */
  loadPayments() {
    this.isLoading = true;
    this.errorMessage = null;

    let apiUrl = this.baseUrl;
    
    // Si se proporciona userId, se usa la ruta de filtro por ID
    if (this.userId !== undefined) {
      apiUrl = `${this.baseUrl}/${this.userId}`;
    } 
    // Si no se proporciona userId, se usa la ruta general para Admin

    this.http.get<Payment[]>(apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (response: Payment[] | any) => {
        // La API devuelve directamente un array de objetos
        this.payments = Array.isArray(response) ? response : response.content || [];
        this.applyFilter();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (httpError) => {
        this.isLoading = false;
        const errors: string[] = this.authService.extractErrorMessages(
          httpError,
          'Error al cargar el historial de pagos.'
        );
        this.errorMessage = errors.join('. ');
      }
    });
  }
  
  /**
   * Aplica el filtro de búsqueda a los pagos.
   */
  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredPayments = this.payments;
    } else {
      this.filteredPayments = this.payments.filter(payment => 
        // Búsqueda por referencia, método, estado o nombre del repartidor (si está disponible)
        payment.referenceCode.toLowerCase().includes(term) ||
        payment.paymentMethod.toLowerCase().includes(term) ||
        payment.status.toLowerCase().includes(term) ||
        (payment.user.firstname + ' ' + payment.user.lastname).toLowerCase().includes(term)
      );
    }
    this.cdr.markForCheck();
  }

  /**
   * Maneja el cambio en el término de búsqueda.
   */
  onSearchChange(newTerm: string) {
    this.searchTerm = newTerm;
    this.applyFilter();
  }

  /**
   * Determina el título de la vista (para la estética).
   */
  getViewTitle(): string {
    return this.userId !== undefined 
      ? `Historial de Pagos`
      : 'Historial General de Pagos de Repartidores';
  }

  /**
   * Determina la descripción de la vista (para la estética).
   */
  getViewDescription(): string {
    return this.userId !== undefined 
      ? 'Consulta todos los pagos recibidos en tu cuenta.'
      : 'Revisa el historial de pagos de todo el personal de reparto registrado.';
  }

    private checkUserRole() {
    // Asumo que el rol '1' es el administrador. Ajusta si tu lógica de Auth es diferente.
    const role = this.authService.getRoleId(); 
    this.isAdmin = role === 1; 
  }

loadDeliveryPersonData(id: number) {
  this.deliveryPerson = null;
  
  this.http.get<DeliveryPersonDetail>(`${this.deliveryPersonApiUrl}/${id}`, { headers: this.getHeaders() }).subscribe({
    next: (response) => {
      this.deliveryPerson = response;
      this.calculateTotalPayable();
      this.cdr.markForCheck();
    },
    error: (httpError) => {
      const errors: string[] = this.authService.extractErrorMessages(
                  httpError, 
                  'Error al cargar datos del repartidor para el pago.'
              );
      this.errorMessage = errors.join('. ');
      this.cdr.markForCheck();
    }
  });
}
   /**
   * Determina si el botón de pago debe estar deshabilitado.
   * Criterios:
   * 1. No hay idEmpleado (Admin está viendo la lista general).
   * 2. No se han cargado los datos del empleado.
   * 3. Ya se hizo un pago este mes (settlementDate es en el mes actual).
   */
  
  /**
   * Calcula el total a pagar según el tipo de contrato.
   */
  calculateTotalPayable(): void {
    if (!this.deliveryPerson || !this.deliveryPerson.contract) {
      this.totalPayable = 0;
      return;
    }

    const contract = this.deliveryPerson.contract;
    const baseSalary = contract.baseSalary;
    const commissions = this.deliveryPerson.commissions;
    const contractType = contract.contractType;

    let total = 0;
    
    if (contractType === 'POR_HORAS') {
      // Cálculo: (hours / 60) * baseSalary + commissions
      // baseSalary se asume como el valor por hora. hours está en minutos.
      const hoursWorked = this.deliveryPerson.hours / 60; 
      const payForHours = hoursWorked * baseSalary; 
      total = payForHours + commissions;
    } else {
      // Cálculo: baseSalary + commissions (Para FIJO u otros)
      total = baseSalary + commissions;
    }
    
    this.totalPayable = total;
  }
  
  // --- Manejo del Modal de Pago ---

openPaymentModal() {
  // Verificar condiciones y mostrar alertas específicas
  if (this.idEmpleado === undefined) {
    this.showAlert('info', 'No se ha seleccionado un empleado para realizar el pago.');
    return;
  }

  if (!this.deliveryPerson) {
    this.showAlert('info', 'No se han cargado los datos del empleado.');
    return;
  }

  // Verificar si ya se pagó este mes
  const lastSettlementDate = this.deliveryPerson.settlementDate;
  if (lastSettlementDate) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const settlementDateObj = new Date(lastSettlementDate);
    const settlementMonth = settlementDateObj.getMonth();
    const settlementYear = settlementDateObj.getFullYear();
    
    if (settlementMonth === currentMonth && settlementYear === currentYear) {
      this.showAlert('info', 'Ya se realizó un pago a este empleado en el mes actual.');
      return;
    }
  }

  // Verificar contrato vigente
  const contractEndDate = this.deliveryPerson?.contract?.endDate;
  if (contractEndDate) {
    const today = new Date();
    const endDate = new Date(contractEndDate);

    if (endDate <= today) {
      this.showAlert('info', 'El empleado no tiene un contrato vigente.');
      return;
    }
  }

  // Si pasa todas las validaciones, abrir el modal
  this.calculateTotalPayable();
  this.isPaymentModalOpen = true;
  this.cdr.markForCheck();
}

  closePaymentModal() {
    this.isPaymentModalOpen = false;
  }
  
  /**
   * Realiza la llamada POST a la API para registrar el pago.
   */
  performPayment() {
    if (!this.deliveryPerson || this.totalPayable <= 0 || !this.idEmpleado) {
      // Si llega aquí, es un error lógico o de datos.
      this.showAlert('danger', 'Error interno: No se pudo procesar el pago o el monto es cero.');
      return;
    }
    
    // Realizar POST a: post http://147.135.215.156:8090/api/v1/payments/:idEmpleado
    this.http.post<any>(`${this.paymentApiUrl}/${this.idEmpleado}`, {}, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        this.showAlert('success', [`Pago de $${this.totalPayable.toFixed(2)} realizado exitosamente.`, `Referencia: ${response.referenceCode}`]);
        this.closePaymentModal();
        this.loadPayments(); // Refrescar historial
        this.loadDeliveryPersonData(this.idEmpleado!); // Refrescar datos del empleado para deshabilitar el botón
      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al registrar el pago. Verifique el estado del servidor.'
                );
        this.showAlert('danger', errors.join('. '));
      }
    });
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