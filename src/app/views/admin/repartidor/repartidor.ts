import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth'; // Asegúrate de que la ruta sea correcta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus, faEdit, faSearch, faUserTie, faBan
} from '@fortawesome/free-solid-svg-icons';

// Importar componentes compartidos (Ajustar las rutas según tu proyecto)
import { Modal } from '../../../components/shared/modal/modal';
import { Searchtable } from '../../../components/shared/searchtable/searchtable';
import { Table, TableColumn, TableAction } from '../../../components/shared/table/table';

// --- Interfaces para Empleados y Tipos de Contrato ---

interface ContractType {
  id: number;
  name: string;
}

interface Employee {
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
}

// Interfaz para la respuesta paginada de la API
interface DeliveryPersonResponse {
  content: Employee[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}


@Component({
  selector: 'app-repartidor',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, DatePipe, DecimalPipe, Modal, Searchtable, Table],
  templateUrl: './repartidor.html',
  styleUrl: './repartidor.css'
})
export class Repartidor implements OnInit {
  // Datos y Estados
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  contractTypes: ContractType[] = [];
  searchTerm: string = '';
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  isLoadingData: boolean = true;
  isLoadingModal: boolean = false; // Para el botón de enviar en el modal

  // Formulario y Empleado Seleccionado
  employeeForm: FormGroup;
  selectedEmployee: Employee | null = null;

  // Íconos
  faPlus = faPlus;
  faEdit = faEdit;
  faSearch = faSearch;
  faUserTie = faUserTie;
  faBan = faBan;

  // Endpoints API
  private employeesApiUrl = 'http://147.135.215.156:8090/api/v1/delivery-person?page=0&size=10000';
  private contractTypesApiUrl = 'http://147.135.215.156:8090/api/v1/contract/type';
  private createEmployeeApiUrl = 'http://147.135.215.156:8090/api/v1/delivery-person';

  // --- Configuración para TablaComponent ---
  tableColumns: TableColumn[] = [
    { key: 'dni', header: 'DNI', type: 'text' },
    { key: 'firstname', header: 'Nombre', type: 'text' },
    { key: 'lastname', header: 'Apellido', type: 'text' },
    { key: 'phoneNumber', header: 'Teléfono', type: 'text' },
    { key: 'email', header: 'Email', type: 'text' },
    { key: 'contractStatus', header: 'Contrato', type: 'text' },
    { key: 'isActive', header: 'Activo', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'Editar',
      icon: faEdit,
      action: 'edit',
      class: 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors'
    },
    // Botón de ejemplo para una acción futura (ej: Cancelar/Desactivar)
    {
      label: 'Desactivar',
      icon: faBan,
      action: 'toggle_active',
      condition: (item: Employee) => item.isActive,
      class: 'px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors'
    },
  ];
  // ----------------------------------------

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.employeeForm = this.fb.group({
      // Datos Personales
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      dni: ['', Validators.required],
      birthDate: ['', Validators.required],
      address: ['', Validators.required],
      emergencyContact: ['', Validators.required],
      // Datos de Contrato
      contractTypeId: [null, Validators.required],
      baseSalary: [0, [Validators.required, Validators.min(0)]],
      commissionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
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
    // Setear el tipo de contrato con el primer valor si existe
    if (this.contractTypes.length > 0) {
      this.employeeForm.get('contractTypeId')?.setValue(this.contractTypes[0].id);
    }
    this.isModalOpen = true;
  }

  openEditModal(employee: Employee) {
    this.isEditMode = true;
    this.selectedEmployee = employee;

    // NOTA: La API de GET de un solo empleado NO fue proporcionada, 
    // por lo que rellenaremos el formulario solo con los datos básicos disponibles en la tabla.
    // Los datos del contrato no están disponibles en la lista de empleados.

    this.employeeForm.patchValue({
      // Datos Personales (simulados/parciales para edición)
      firstname: employee.firstname,
      lastname: employee.lastname,
      phoneNumber: employee.phoneNumber,
      dni: employee.dni,
      // Los campos birthDate, address, emergencyContact no están en la lista, se dejan vacíos si no se cargan

      // Datos de Contrato (se asume que el ID y el resto de campos deben rellenarse de nuevo)
      contractTypeId: null,
      baseSalary: 0,
      commissionPercentage: 0,
      endDate: ''
    });

    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.employeeForm.reset();
  }

  // --- Lógica de Búsqueda ---
  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchEmployees(term);
  }

  searchEmployees(term: string) {
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

  // --- Lógica de Acciones de la Tabla ---

  handleTableAction(event: { action: string, item: Employee }): void {
    const employee = event.item;
    switch (event.action) {
      case 'edit':
        this.openEditModal(employee);
        break;
      case 'toggle_active':
        console.log(`Placeholder: Desactivar/Activar empleado con ID: ${employee.userId}`);
        // Aquí iría la lógica para llamar a la API de desactivación/activación.
        break;
      default:
        console.warn(`Acción desconocida: ${event.action}`);
    }
  }

  // --- Lógica de Envío de Formulario (Creación/Edición) ---

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isLoadingModal = true;
    const headers = this.getHeaders();
    const formValue = this.employeeForm.value;

    const payload = {
      firstname: formValue.firstname,
      lastname: formValue.lastname,
      phoneNumber: formValue.phoneNumber,
      dni: formValue.dni.toString(), // Asegurar que DNI sea string si la API lo pide
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

    if (this.isEditMode && this.selectedEmployee) {
      // Placeholder: Lógica para editar (API PUT no proporcionada)
      console.log('Placeholder: API de edición de empleado NO disponible.', payload);
      alert('Funcionalidad de edición no implementada. Revisar consola para payload.');
      this.isLoadingModal = false;
      this.closeModal();

    } else {
      // Lógica para crear
      this.http.post(this.createEmployeeApiUrl, payload, { headers })
        .subscribe({
          next: () => {
            alert('Empleado creado exitosamente.');
            this.loadEmployees();
            this.isLoadingModal = false;
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating employee:', error);
            alert('Error al crear empleado. Revise la consola.');
            this.isLoadingModal = false;
          }
        });
    }
  }
}