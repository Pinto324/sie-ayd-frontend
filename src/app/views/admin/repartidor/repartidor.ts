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
  // CAMPOS AÑADIDOS PARA EL EDITAR (Asumiendo que vienen en la data)
  birthDate: string;
  address: string;
  emergencyContact: string;
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
  standalone: true, // Asegúrate de que esto esté aquí si es un standalone component
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
        // Se reestablece el validador Validators.required
        control.setValidators(control.value === 'contractTypeId' ? Validators.required : [Validators.required, Validators.min(0)]);
      }
    });
    this.employeeForm.get('commissionPercentage')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    this.employeeForm.updateValueAndValidity();


    // Setear el tipo de contrato con el primer valor si existe
    if (this.contractTypes.length > 0) {
      this.employeeForm.get('contractTypeId')?.setValue(this.contractTypes[0].id);
    }
    this.isModalOpen = true;
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

  handleTableAction(event: { action: string, item: Employee }): void {
    // ... (Lógica de acciones de tabla sin cambios)
    const employee = event.item;
    switch (event.action) {
      case 'edit':
        this.openEditModal(employee);
        break;
      case 'toggle_active':
        console.log(`Placeholder: Desactivar/Activar empleado con ID: ${employee.userId}`);
        break;
      default:
        console.warn(`Acción desconocida: ${event.action}`);
    }
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
            alert('Empleado actualizado exitosamente.');
            this.loadEmployees();
            this.isLoadingModal = false;
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            alert('Error al actualizar empleado. Revise la consola.');
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