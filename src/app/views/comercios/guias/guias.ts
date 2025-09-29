import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus, faEdit, faTimes, faSearch,
  faBoxOpen, faBoxArchive, faTruckRampBox, faTruckFast, faCheck, faBan
} from '@fortawesome/free-solid-svg-icons';

// Importar los nuevos componentes y interfaces
import { Searchtable } from '../../../components/shared/searchtable/searchtable';
import { Table, TableColumn, TableAction } from '../../../components/shared/table/table';
import { Modal } from '../../../components/shared/modal/modal';
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
}

@Component({
  selector: 'app-guias',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, Searchtable, Table, Modal],
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
  guideForm: FormGroup;

  tableColumns: TableColumn[] = [
    { key: 'code', header: 'Código', type: 'text' },
    { key: 'recipient', header: 'Destinatario', type: 'text' },
    { key: 'price', header: 'Precio', type: 'currency', pipeFormat: '1.2-2' },
    { key: 'type', header: 'Tipo de Paquete', type: 'nested', nestedKey: 'name' },
    { key: 'createdAt', header: 'Fecha de Creación', type: 'date', pipeFormat: 'short' },
    { key: 'status', header: 'Estado', type: 'iconStatus', nestedKey: 'name' }, // Usar iconStatus
  ];

  statusIcons: { [key: number]: any } = {
    1: faBoxOpen,
    2: faBoxArchive,
    3: faTruckRampBox,
    4: faTruckFast,
    5: faCheck,
    6: faBan,
  };

  tableActions: TableAction[] = [
    {
      label: 'Editar',
      icon: faEdit,
      action: 'edit',
      condition: (guide: Guide) => this.canEditOrCancel(guide.status.id), // Condición basada en el estado
      class: 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors'
    },
    {
      label: 'Cancelar',
      icon: faTimes,
      action: 'cancel',
      condition: (guide: Guide) => this.canEditOrCancel(guide.status.id), // Condición basada en el estado
      class: 'px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors'
    },
  ];

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
      case 'edit':
        this.openEditModal(guide);
        break;
      case 'cancel':
        this.cancelGuide(guide);
        break;
      default:
        console.warn(`Acción desconocida: ${event.action}`);
    }
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
              this.loadGuides();
              this.closeModal();
            },
            error: (error) => {
              console.error('Error updating guide:', error);
            }
          });
      } else {
        // Lógica para crear
        this.http.post(this.guidesApiUrl, payload, { headers })
          .subscribe({
            next: () => {
              console.log('Guide created successfully');
              this.loadGuides();
              this.closeModal();
            },
            error: (error) => {
              console.error('Error creating guide:', error);
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
          console.log('Guide cancelled successfully');
          this.loadGuides();
        },
        error: (error) => {
          console.error('Error cancelling guide:', error);
        }
      });
    }
  }

  canEditOrCancel(statusId: number): boolean {
    return statusId === 1 || statusId === 2;
  }
}
