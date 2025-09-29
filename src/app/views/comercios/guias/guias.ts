import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus, faEdit, faTimes, faSearch, faEye, faArrowLeft,
  faBoxOpen, faBoxArchive, faTruckRampBox, faTruckFast, faCheck, faBan, faExclamation
} from '@fortawesome/free-solid-svg-icons';

// Importar los nuevos componentes y interfaces
import { Searchtable } from '../../../components/shared/searchtable/searchtable';
import { Table, TableColumn, TableAction } from '../../../components/shared/table/table';
import { Modal } from '../../../components/shared/modal/modal';
import { Alert } from '../../../components/shared/alert/alert';
import { AlertType } from '../../../components/shared/alert/alert-type.type';
import { Guiadetalle } from '../../../components/shared/guiadetalle/guiadetalle';
interface Commerce {
  id: number;
  nit: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  member: string;
  address: string;
}

interface Status {
  id: number;
  name: string;
  description: string;
}

interface PackageType {
  id: number;
  name: string;
  description: string;
  basePrice: number;
}

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
  deliveryDate: string;
  guideType: string;
}

@Component({
  selector: 'app-guias',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Guiadetalle,FontAwesomeModule, Searchtable, Table, Modal, Alert],
  templateUrl: './guias.html',
  styleUrl: './guias.css'
})
export class Guias {
  guides: Guide[] = [];
  filteredGuides: Guide[] = [];
  packageTypes: PackageType[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  isEditMode = false;
  selectedGuide: Guide | null = null;
  faPlus = faPlus;
  faEdit = faEdit;
  faTimes = faTimes;
  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  guideForm: FormGroup;
  showDetailView: boolean = false; // TRUE: Muestra el detalle; FALSE: Muestra la tabla
  selectedGuideCode: string | null = null; 

  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';

  tableColumns: TableColumn[] = [
    { key: 'code', header: 'Código', type: 'text' },
    { key: 'recipient', header: 'Destinatario', type: 'text' },
    { key: 'price', header: 'Precio', type: 'currency', pipeFormat: '1.2-2' },
    { key: 'type', header: 'Tipo de Paquete', type: 'nested', nestedKey: 'name' },
    { key: 'createdAt', header: 'Fecha de Creación', type: 'date', pipeFormat: 'dd/MM/yyyy - HH:mm' },
    { key: 'status', header: 'Estado', type: 'iconStatus', nestedKey: 'name' }, 
  ];

  statusIcons: { [key: number]: any } = {
    1: faBoxOpen,
    2: faBoxArchive,
    3: faTruckRampBox,
    4: faTruckFast,
    5: faCheck,
    6: faBan,
    8: faExclamation,
  };

  tableActions = [
  {
      label: 'Ver Detalle',
      icon: faEye,
      action: 'view_detail',
      class: 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors'
    },
    {
      label: 'Editar',
      icon: faEdit,
      action: 'edit',
      condition: (guide: Guide) => guide.guideType === 'NORMAL' && this.canEditOrCancel(guide.status.id),
      class: 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors'
    },
    {
      label: 'Cancelar',
      icon: faTimes,
      action: 'cancel',
      condition: (guide: Guide) => guide.guideType === 'NORMAL' && this.canEditOrCancel(guide.status.id),
      class: 'px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors'
    },
    {
      label: 'Guía de devolución',
      icon: faExclamation,
      action: 'aviso',
      condition: (guide: Guide) => guide.guideType !== 'NORMAL',
      class: 'px-3 py-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors'
    }
  ];
  goBackToTable() {
    this.showDetailView = false;
    this.selectedGuideCode = null;
  }

  private guidesApiUrl = 'http://147.135.215.156:8090/api/v1/guides';
  private packageTypeApiUrl = 'http://147.135.215.156:8090/api/v1/package-type';
  private cancelGuideUrl = 'http://147.135.215.156:8090/api/v1/guides/cancel';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.guideForm = this.fb.group({
      packageId: ['', Validators.required],
      recipientName: ['', Validators.required],
      recipientAddress: ['', Validators.required],
      recipientPhone: [''],
      recipientEmail: ['', [Validators.required, Validators.email]],
      packageDescription: [''],
      deliveryDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadGuides();
    this.loadPackageTypes();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadGuides() {
    const headers = this.getHeaders();
    this.http.get<Guide[]>(this.guidesApiUrl, { headers }).subscribe({
      next: (response) => {
        this.guides = response;
        this.searchGuides(this.searchTerm); // Aplicar el filtro después de cargar
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading guides:', error);
      }
    });
  }
  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchGuides(term);
  }

  handleTableAction(event: { action: string, item: Guide }): void {
    const guide = event.item;
    switch (event.action) {
      case 'view_detail':
        this.openDetailView(guide.code);
        break;
      case 'edit':
        this.openEditModal(guide);
        break;
      case 'cancel':
        this.cancelGuide(guide);
        break;
      case 'aviso':
        this.MostrarInfoDevolucion()
        break;
      default:
        console.warn(`Acción desconocida: ${event.action}`);
    }
  }
  openDetailView(code: string) {
    this.selectedGuideCode = code;
    this.showDetailView = true;
  }

  loadPackageTypes() {
    const headers = this.getHeaders();
    this.http.get<PackageType[]>(this.packageTypeApiUrl, { headers }).subscribe({
      next: (response) => {
        this.packageTypes = response;
      },
      error: (error) => {
        console.error('Error loading package types:', error);
      }
    });
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
      guide.type.name.toLowerCase().includes(lowerCaseTerm) ||
      guide.status.name.toLowerCase().includes(lowerCaseTerm) // Añadir filtro por estado
    );
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedGuide = null;
    this.guideForm.reset();
    this.isModalOpen = true;
  }

  openEditModal(guide: Guide) {
    this.isEditMode = true;
    this.selectedGuide = guide;
    this.guideForm.patchValue({
      packageId: guide.type.id,
      recipientName: guide.recipient,
      recipientAddress: guide.address,
      recipientPhone: guide.phone,
      recipientEmail: guide.email,
      packageDescription: guide.description,
      deliveryDate: guide.deliveryDate
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.guideForm.reset();
  }

  onSubmit() {
    if (this.guideForm.valid) {
      const formData = this.guideForm.value;
      const headers = this.getHeaders();
      const payload = {
        packageId: Number(formData.packageId),
        recipientName: formData.recipientName,
        recipientAddress: formData.recipientAddress,
        recipientPhone: formData.recipientPhone,
        recipientEmail: formData.recipientEmail,
        packageDescription: formData.packageDescription,
        deliveryDate: formData.deliveryDate
      };

      if (this.isEditMode && this.selectedGuide) {
        // Lógica para editar
        this.http.put(`${this.guidesApiUrl}/${this.selectedGuide.id}`, payload, { headers })
          .subscribe({
            next: () => {
              this.showAlert('success', 'Guía editada correctamente');
              this.loadGuides();
              this.closeModal();
            },
            error: (error) => {
              const errors: string[] = this.authService.extractErrorMessages(
                    error, 
                    'Error al crear empleado. Por favor, intente de nuevo.' // Mensaje por defecto
                );
            this.showAlert('danger', errors);
            }
          });
      } else {
        // Lógica para crear
        this.http.post(this.guidesApiUrl, payload, { headers })
          .subscribe({
            next: () => {
              this.showAlert('success', 'Guía creada exitosamente');
              this.loadGuides();
              this.closeModal();
            },
            error: (error) => {
              const errors: string[] = this.authService.extractErrorMessages(
                    error, 
                    'Error al crear guía. Por favor, intente de nuevo.' // Mensaje por defecto
                );
            this.showAlert('danger', errors);
            }
          });
      }
    }
  }

  cancelGuide(guide: Guide) {
    if (confirm(`¿Estás seguro de que quieres cancelar la guía con código ${guide.code}?`)) {
      const headers = this.getHeaders();
      this.http.put(`${this.cancelGuideUrl}/${guide.id}`, {}, { headers }).subscribe({
        next: () => {
          this.showAlert('success', 'Guía cancelada exitosamente');
          this.loadGuides();
        },
        error: (error) => {
          const errors: string[] = this.authService.extractErrorMessages(
                    error, 
                    'Error al cancelar guía. Por favor, intente de nuevo.' // Mensaje por defecto
          );
            this.showAlert('danger', errors);
        }
      });
    }
  }

  canEditOrCancel(statusId: number): boolean {
    return statusId === 1 || statusId === 2;
  }

  MostrarInfoDevolucion() { 
    this.showAlert('info', 'Una guía de devolución se crea automaticamente cuando un cliente rechaza una entrega o un repartidor informa de un problema, al ser un proceso de devolución no se puede editar o cancelar')
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
