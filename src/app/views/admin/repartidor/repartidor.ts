import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth'; // Asegúrate de que la ruta sea correcta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus, faEdit, faSearch, faUserTie, faBan,faFileContract, faArrowLeft, faMoneyBill, faFileInvoiceDollar
} from '@fortawesome/free-solid-svg-icons';

// Importar componentes compartidos (Ajustar las rutas según tu proyecto)
import { Modal } from '../../../components/shared/modal/modal';
import { Searchtable } from '../../../components/shared/searchtable/searchtable';
import { Table, TableColumn, TableAction } from '../../../components/shared/table/table';
import { Alert } from '../../../components/shared/alert/alert';
import { AlertType } from '../../../components/shared/alert/alert-type.type';
import { Historialpagos } from '../../../components/shared/view/historialpagos/historialpagos';
// --- Interfaces para Empleados y Tipos de Contrato ---

interface ContractType {
  id: number;
  name: string;
}

interface Contract {
  id: number;
  contractType: string;
  baseSalary: number;
  commissionPercentage: number;
  endDate: string; // Formato "YYYY-MM-DD"
  startDate: string;
  contractStatus: 'ACTIVO' | 'BAJA' | 'EXPIRADO' | string;
}


interface Employee {
  id: number;
  userId: number;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  email: string;
  dni: number;
  isActive: boolean;
  use2fa: boolean;
  contractId: number;
  contractStatus: string;
  birthDate: string;
  address: string;
  emergencyContact: string;
  settlementDate: string;
}

interface DeliveryPersonDetail extends Employee {
  contract: Contract;
  commissions: number;
}

// Interfaz para la respuesta paginada de la API
interface DeliveryPersonResponse {
  content: Employee[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
interface ContractHistoryResponse {
    content: Contract[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

@Component({
  selector: 'app-repartidor',
  standalone: true, // Asegúrate de que esto esté aquí si es un standalone component
  imports: [CommonModule, FormsModule, Historialpagos,ReactiveFormsModule, Alert,FontAwesomeModule, DatePipe, DecimalPipe, Modal, Searchtable, Table],
  templateUrl: './repartidor.html',
  styleUrl: './repartidor.css'
})
export class Repartidor implements OnInit {
  viewMode: 'historial'|'table' | 'contracts' = 'table'; 
  // Datos y Estados
  employees: Employee[] = [];
  idEmpleadoHistorial: number = 0;
  idEmpleadoPagos: number = 0;
  filteredEmployees: Employee[] = [];
  contractTypes: ContractType[] = [];
  searchTerm: string = '';
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  isLoadingData: boolean = true;
  isLoadingModal: boolean = false; // Para el botón de enviar en el modal
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
    contractHistory: Contract[] = [];
  // Formulario y Empleado Seleccionado
  employeeForm: FormGroup;
  selectedEmployee: Employee | null = null;
  errorMessage: string | null = null;
  // Íconos
  faPlus = faPlus;
  faEdit = faEdit;
  faSearch = faSearch;
  faUserTie = faUserTie;
  faBan = faBan;
faFileContract = faFileContract; // NUEVO
  faArrowLeft = faArrowLeft;  
  faMoneyBill = faMoneyBill;
  faFileInvoiceDollar = faFileInvoiceDollar;
  // --- Estados de Modales y Datos de Contratos ---
  selectedDeliveryPersonDetail: DeliveryPersonDetail | null = null; // NUEVO: Detalle completo del repartidor
  isContractModalOpen: boolean = false; // NUEVO: Modal de Contratos
contractModalMode: 'nuevo' | 'renovar' = 'nuevo'; 
  contractForm: FormGroup; // NUEVO: Formulario para Nuevo/Renovar Contrato
// Endpoints API
  private employeesApiUrl = 'http://147.135.215.156:8090/api/v1/delivery-person?page=0&size=10000';
  private deliveryPersonDetailUrl = 'http://147.135.215.156:8090/api/v1/delivery-person'; // + /:id (userId)
  private contractTypesApiUrl = 'http://147.135.215.156:8090/api/v1/contract/type';
  private createEmployeeApiUrl = 'http://147.135.215.156:8090/api/v1/delivery-person';
  private contractBajaUrl = 'http://147.135.215.156:8090/api/v1/contract/baja'; // + /:contractId
  private contractNuevoUrl = 'http://147.135.215.156:8090/api/v1/contract/nuevo'; // + /:userId
  private contractRenovarUrl = 'http://147.135.215.156:8090/api/v1/contract/renovar'; // + /:contractId
  private contractHistoryUrl = 'http://147.135.215.156:8090/api/v1/contract/history'; // + /:userId

  // --- Configuración para TablaComponent ---
  tableColumns: TableColumn[] = [
    { key: 'dni', header: 'DNI', type: 'text' },
    { key: 'firstname', header: 'Nombre', type: 'text' },
    { key: 'lastname', header: 'Apellido', type: 'text' },
    { key: 'phoneNumber', header: 'Teléfono', type: 'text' },
    { key: 'email', header: 'Email', type: 'text' },
    { key: 'contractStatus', header: 'Contrato', type: 'text' },
  ];
  historyColumns: TableColumn[] = [
    { key: 'id', header: 'ID', type: 'text' },
    { key: 'contractType', header: 'Tipo de Contrato', type: 'text' },
    { key: 'baseSalary', header: 'Salario Base', type: 'currency', pipeFormat: '1.2-2' },
    { key: 'commissionPercentage', header: '% Comisión', type: 'text' },
    { key: 'startDate', header: 'Inicio', type: 'date', pipeFormat: 'dd/MM/yyyy'},
    { key: 'endDate', header: 'Fin', type: 'date', pipeFormat: 'dd/MM/yyyy' },
    { key: 'contractStatus', header: 'Estado', type: 'text' },
  ];

tableActions: TableAction[] = [
    {
      label: 'Editar',
      icon: faEdit,
      action: 'edit',
      class: 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors'
    },
    { // NUEVA ACCIÓN DE CONTRATOS
      label: 'Contratos',
      icon: faFileContract,
      action: 'view_contracts',
      class: 'px-3 py-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors'
    },
    { // NUEVA ACCIÓN historial de contratos
      label: 'Pagos',
      icon: faFileInvoiceDollar,
      action: 'view_historial',
      class: 'px-3 py-1 bg-purple-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors'
    }
  ];

  // ----------------------------------------

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    // Definir los validadores iniciales (Requeridos para el modo CREAR)
this.employeeForm = this.fb.group({
  // Datos Personales
  firstname: ['', Validators.required],
  lastname: ['', Validators.required],
  phoneNumber: ['', Validators.required],
  dni: ['', Validators.required],
  birthDate: ['', Validators.required],
  address: ['', Validators.required],
  emergencyContact: ['', Validators.required],
  // Datos de Contrato (Solo requeridos para CREACIÓN)
  contractTypeId: [null, Validators.required],
  baseSalary: [0, [Validators.required, Validators.min(0)]],
  commissionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  endDate: ['', Validators.required]
  // Quitamos settlementDate ya que no existe en el POST
});
     this.contractForm = this.fb.group({
      contractTypeId: [null],
      baseSalary: [0],
      commissionPercentage: [0],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadEmployees();
    this.loadContractTypes();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Usar servicio de autenticación
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // --- Carga de Datos ---

  loadEmployees() {
    this.isLoadingData = true;
    const headers = this.getHeaders();
    this.http.get<DeliveryPersonResponse>(this.employeesApiUrl, { headers }).subscribe({
      next: (response) => {
        this.employees = response.content;
        this.searchEmployees(this.searchTerm);
        this.isLoadingData = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.isLoadingData = false;
      }
    });
  }

  loadContractTypes() {
    const headers = this.getHeaders();
    this.http.get<ContractType[]>(this.contractTypesApiUrl, { headers }).subscribe({
      next: (response) => {
        this.contractTypes = response;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading contract types:', error);
      }
    });
  }

  // --- Modal y Formulario ---

openCreateModal() {
  this.isEditMode = false;
  this.selectedEmployee = null;
  this.employeeForm.reset({
    // Valores por defecto
    baseSalary: 0,
    commissionPercentage: 0
  });

   // Restaurar Validadores Requeridos para CREACIÓN
  const requiredFields = ['firstname', 'lastname', 'phoneNumber', 'dni', 'birthDate', 'address', 'emergencyContact', 'contractTypeId', 'baseSalary', 'commissionPercentage', 'endDate'];
  requiredFields.forEach(field => {
    const control = this.employeeForm.get(field);
    if (control) {
      control.setValidators(Validators.required);
      if (field === 'commissionPercentage') {
        control.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else if (field === 'baseSalary') {
        control.setValidators([Validators.required, Validators.min(0)]);
      }
    }
  });
  this.employeeForm.updateValueAndValidity();

  // Setear el tipo de contrato con el primer valor si existe
  if (this.contractTypes.length > 0) {
    this.employeeForm.get('contractTypeId')?.setValue(this.contractTypes[0].id);
  }
  this.isModalOpen = true;
  this.cdr.markForCheck();
}

  openEditModal(employee: Employee) {
    this.isEditMode = true;
    this.selectedEmployee = employee;

    // Pre-llenar campos de datos personales (incluyendo los recién solicitados)
    this.employeeForm.patchValue({
      firstname: employee.firstname,
      lastname: employee.lastname,
      phoneNumber: employee.phoneNumber,
      dni: employee.dni.toString(), // Convertir a string para el control del formulario
      birthDate: employee.birthDate, // Asumiendo que ahora viene en la data
      address: employee.address,     // Asumiendo que ahora viene en la data
      emergencyContact: employee.emergencyContact, // Asumiendo que ahora viene en la data

      // Dejar los campos de contrato vacíos, ya que no se usan en el PUT
      contractTypeId: null,
      baseSalary: 0,
      commissionPercentage: 0,
      endDate: ''
    });

    // --- REMOVER VALIDACIONES REQUERIDAS PARA EDICIÓN ---
    // Hacemos que los campos de datos personales sean opcionales
    const fieldsToMakeOptional = ['firstname', 'lastname', 'phoneNumber', 'dni', 'birthDate', 'address', 'emergencyContact'];
    fieldsToMakeOptional.forEach(field => {
      this.employeeForm.get(field)?.clearValidators();
      this.employeeForm.get(field)?.setValidators(null); // Asegura que no haya validadores
    });

    // También remover validaciones de campos de contrato
    this.employeeForm.get('contractTypeId')?.clearValidators();
    this.employeeForm.get('baseSalary')?.clearValidators();
    this.employeeForm.get('commissionPercentage')?.clearValidators();
    this.employeeForm.get('endDate')?.clearValidators();

    this.employeeForm.updateValueAndValidity(); // Recalcular la validez del formulario

    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal() {
    this.isModalOpen = false;
    this.employeeForm.reset();
  }

  // --- Lógica de Búsqueda y Acciones de la Tabla ---

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchEmployees(term);
  }

  searchEmployees(term: string) {
    // ... (Lógica de búsqueda sin cambios)
    if (!term) {
      this.filteredEmployees = this.employees;
      return;
    }

    const lowerCaseTerm = term.toLowerCase();
    this.filteredEmployees = this.employees.filter(employee =>
      employee.firstname.toLowerCase().includes(lowerCaseTerm) ||
      employee.lastname.toLowerCase().includes(lowerCaseTerm) ||
      employee.dni.toString().includes(lowerCaseTerm) ||
      employee.email.toLowerCase().includes(lowerCaseTerm)
    );
  }

handleTableAction(event: { action: string, item: Employee }) {
  if (event.action === 'edit') {
      this.openEditModal(event.item);
    } else if (event.action === 'view_contracts') {
      this.loadDeliveryPersonContracts(event.item.userId, event.item); // Llama a la nueva lógica
    } else if (event.action === 'view_historial') { 
      this.abrirhistorialPagos(event.item);
    }
  }
 /**
   * Carga el detalle del repartidor (incluyendo el contrato) y el historial.
   */
  loadDeliveryPersonContracts(userId: number, employee: Employee) {
    this.isLoadingData = true;
    this.selectedEmployee = employee;
    this.errorMessage = null;

    // 1. Cargar el detalle del contrato actual
    const detail$ = this.http.get<DeliveryPersonDetail>(`${this.deliveryPersonDetailUrl}/${employee.id}`, { headers: this.getHeaders() });
    
    // 2. Cargar el historial de contratos
    const history$ = this.http.get<ContractHistoryResponse>(
        `${this.contractHistoryUrl}/${employee.userId}?page=0&size=100000`, 
        { headers: this.getHeaders() }
    );
    
    // Usar forkJoin para esperar ambas peticiones (requiere importar forkJoin de 'rxjs')
    // Nota: Si no usas 'rxjs', encadena las peticiones con .pipe(switchMap) o realiza la segunda en el 'next' de la primera.
    // Asumiendo que SÍ usas 'rxjs' en tu proyecto para manejos complejos de observables:
    
    // Temporalmente, cargaremos el historial después del detalle para mantener la sencillez sin añadir un nuevo import:
    detail$.subscribe({
      next: (detailResponse) => {
        this.selectedDeliveryPersonDetail = detailResponse;
        
        history$.subscribe({
            next: (historyResponse) => {
                this.contractHistory = historyResponse.content.sort((a, b) => {
                    // Ordenar por fecha de inicio descendente (contratos más recientes primero)
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                }); 
                this.viewMode = 'contracts'; // Cambia la vista solo al tener todo cargado
                this.isLoadingData = false;
            this.cdr.markForCheck();
                    console.log(historyResponse);
            },
            error: (httpError) => {
                 const errors: string[] = this.authService.extractErrorMessages(
                    httpError,
                    'Error al obtener el historial de contratos.'
                );
                this.errorMessage = errors.join('. ');
                this.isLoadingData = false;
            }
        });

      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(
          httpError,
          'Error al obtener el detalle del repartidor y su contrato.'
        );
        this.errorMessage = errors.join('. ');
        this.isLoadingData = false;
      }
    });
  }
/**
   * Recarga los detalles del contrato y su historial después de una acción de POST.
   */
  private reloadContractView() {
    if (this.selectedDeliveryPersonDetail && this.selectedEmployee) {
        this.loadDeliveryPersonContracts(this.selectedDeliveryPersonDetail.userId, this.selectedEmployee);
    }
  }
  /**
   * Regresa a la vista principal de la tabla de repartidores.
   */
  goBackToTable() {
    this.viewMode = 'table';
    this.selectedDeliveryPersonDetail = null;
    this.selectedEmployee = null;
    this.loadEmployees(); // Recargar la tabla para reflejar posibles cambios de estado
    this.cdr.markForCheck();
  }

  /**
   * Determina si el contrato ha expirado comparando endDate con la fecha actual.
   */
  isContractExpired(endDate: string): boolean {
    return new Date(endDate) < new Date();
  }
  // --- LÓGICA DE MODALES DE CONTRATO (Nuevo/Renovar) ---

  /**
   * Abre el modal para crear un nuevo contrato.
   */
  openNewContractModal(userId: number) {
   this.contractModalMode = 'nuevo'; 
    this.contractForm.reset({ baseSalary: 0, commissionPercentage: 0, contractTypeId: null });
    this.setContractFormValidation(true);
    this.isContractModalOpen = true;
  }

  /**
   * Abre el modal para renovar un contrato.
   */
  openRenovateContractModal(contractId: number) {
    this.contractModalMode = 'renovar'; // CORREGIDO
    this.contractForm.reset({ endDate: '' });
    this.setContractFormValidation(false); // Solo se requiere endDate
    this.isContractModalOpen = true;
  }

  /**
   * Ajusta los validadores del formulario de contrato según el modo (Nuevo o Renovar).
   */
  setContractFormValidation(isNew: boolean) {
    // Campos comunes que siempre se limpian/actualizan
    ['contractTypeId', 'baseSalary', 'commissionPercentage', 'endDate'].forEach(key => {
      this.contractForm.get(key)?.clearValidators();
    });

    if (isNew) {
      this.contractForm.get('contractTypeId')?.setValidators(Validators.required);
      this.contractForm.get('baseSalary')?.setValidators([Validators.required, Validators.min(0)]);
      this.contractForm.get('commissionPercentage')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    }
    
    // El campo endDate es requerido en ambos modos (Nuevo y Renovar)
    this.contractForm.get('endDate')?.setValidators(Validators.required);

    // Aplicar los cambios
    Object.keys(this.contractForm.controls).forEach(key => {
      this.contractForm.get(key)?.updateValueAndValidity();
    });
  }
executeContractBaja(contractId: number) {
    if (!confirm('¿Está seguro de dar de baja este contrato? Esta acción es irreversible.')) return;

    this.isLoadingData = true;
    this.http.post<any>(`${this.contractBajaUrl}/${contractId}`, {}, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.showAlert('success', 'Contrato dado de baja correctamente.');
        // Forzar la recarga de los detalles para reflejar el cambio de estado
        this.reloadContractView(); 
        this.loadEmployees();
        this.loadDeliveryPersonContracts(this.selectedDeliveryPersonDetail!.userId, this.selectedEmployee!);
      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(httpError, 'Error al dar de baja el contrato.');
        this.showAlert('danger', errors);
        this.isLoadingData = false;
      }
    });
  }
  /**
   * Envía los datos del formulario de contrato (Nuevo o Renovar).
   */
  onContractSubmit() {
    if (!this.contractForm.valid || !this.selectedDeliveryPersonDetail) return;

    this.isLoadingModal = true;
    const formValue = this.contractForm.value;
    const headers = this.getHeaders();
    const userId = this.selectedDeliveryPersonDetail.userId;
    const contractId = this.selectedDeliveryPersonDetail.contract.id;
    let url = '';
    let payload: any;
    let successMessage = '';

    if (this.contractModalMode ===  'nuevo') {
      url = `${this.contractNuevoUrl}/${userId}`;
      payload = {
        contractTypeId: formValue.contractTypeId,
        baseSalary: formValue.baseSalary,
        commissionPercentage: formValue.commissionPercentage,
        endDate: formValue.endDate
      };
      successMessage = 'Nuevo contrato creado exitosamente.';

    } else if (this.contractModalMode === 'renovar') {
      url = `${this.contractRenovarUrl}/${contractId}`;
      payload = { endDate: formValue.endDate };
      successMessage = 'Contrato renovado exitosamente.';
    }

    this.http.post<any>(url, payload, { headers }).subscribe({
      next: () => {
        this.showAlert('success', successMessage);
        // Recargar el detalle del repartidor y su contrato
        this.loadDeliveryPersonContracts(userId, this.selectedEmployee!);
         this.reloadContractView();
        this.closeContractModal();
      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(httpError, `Error al ${this.contractModalMode === 'nuevo' ? 'crear' : 'renovar'} el contrato.`);
        this.showAlert('danger', errors);
        this.isLoadingModal = false;
      }
    });
  }

  /**
   * Cierra el modal de contratos y limpia el estado.
   */
  closeContractModal() {
    this.isContractModalOpen = false;
    this.contractForm.reset();
    this.isLoadingModal = false;
    this.cdr.markForCheck();
  }


  // --- Lógica de Envío de Formulario (Creación/Edición) ---

  onSubmit() {
    // En modo EDICIÓN, como se quitaron los Validators.required,
    // el formulario.valid siempre será true si no hay otros errores.
    // Solo validamos la validez para CREACIÓN, donde sí son requeridos.
    if (!this.isEditMode && this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isLoadingModal = true;
    const headers = this.getHeaders();
    const formValue = this.employeeForm.value;

    if (this.isEditMode && this.selectedEmployee) {
      // Lógica para editar (API PUT)
      const editPayload = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        phoneNumber: formValue.phoneNumber,
        dni: formValue.dni.toString(),
        birthDate: formValue.birthDate,
        address: formValue.address,
        emergencyContact: formValue.emergencyContact
      };

      this.http.put(`${this.createEmployeeApiUrl}/${this.selectedEmployee.userId}`, editPayload, { headers })
        .subscribe({
          next: () => {
            this.showAlert('success', 'El usuario se modifico correctamente');
            this.loadEmployees();
            this.isLoadingModal = false;
            this.closeModal();
          },
          error: (error) => {
            const errors: string[] = this.authService.extractErrorMessages(
                    error, 
                    'Error al modificar empleado. Por favor, intente de nuevo.' // Mensaje por defecto
                );
            this.showAlert('danger', errors);
            this.isLoadingModal = false;
          }
        });

    } else {
      // Lógica para crear
      // (sin cambios, ya que aquí sí se requieren todos los campos de contrato y personales)
      const payload = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        phoneNumber: formValue.phoneNumber,
        dni: formValue.dni.toString(),
        birthDate: formValue.birthDate,
        address: formValue.address,
        emergencyContact: formValue.emergencyContact,
        contract: {
          contractTypeId: formValue.contractTypeId,
          baseSalary: formValue.baseSalary,
          commissionPercentage: formValue.commissionPercentage,
          endDate: formValue.endDate
        }
      };

this.http.post<any>(this.createEmployeeApiUrl, payload, { headers })
    .subscribe({
        next: (response) => {
            const successMessages: string[] = [
                '¡El empleado ha sido creado exitosamente!',
                `Usuario: ${response.email}`,
                `Contraseña Temporal: ${response.password}`
            ];
            this.showAlert('success', successMessages);
            
            this.loadEmployees();
            this.isLoadingModal = false;
            this.closeModal(); 
        },
        error: (httpError) => {
            this.isLoadingModal = false;
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al crear empleado. Por favor, intente de nuevo.' // Mensaje por defecto
                );
            this.showAlert('danger', errors);
        }
    });
    }
  }
  abrirhistorialPagos(employees:Employee) { 
    this.idEmpleadoHistorial = employees.userId;
    this.idEmpleadoPagos = employees.id;
    this.viewMode = 'historial';
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