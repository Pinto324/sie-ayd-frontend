import { ChangeDetectorRef, Component, OnInit, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faSearch, faChartLine, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Fidelizacioncomercio } from '../../../../components/shared/view/fidelizacioncomercio/fidelizacioncomercio';

// Interface para la estructura de un comercio aceptado
interface Commerce {
  id: number;
  nit: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  address: string;
  use2fa: boolean;
  isActive: boolean;
}

// Interface para la respuesta de la API
interface ApiResponse {
  content: Commerce[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
@Component({
  selector: 'app-comercios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule,Fidelizacioncomercio],
  templateUrl: './comercios.html',
  styleUrl: './comercios.css'
})
export class Comercios implements OnInit {
  commerces: Commerce[] = [];
  filteredCommerces: Commerce[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  selectedCommerce: Commerce | null = null;
  faEdit = faEdit;
  faSearch = faSearch;
  faChartLine = faChartLine;
  faArrowLeft = faArrowLeft;
  commerceForm: FormGroup;
  showActions: boolean = false;
  viewMode: 'table' | 'report' = 'table'; // Define el estado de la vista
  selectedCommerceId: number | null = null; 
  nameCommerceId: string | null = null; 


  private apiUrl = 'http://147.135.215.156:8090/api/v1/commerce?page=0&size=10000';
  private updateUrl = 'http://147.135.215.156:8090/api/v1/commerce';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.commerceForm = this.fb.group({
      name: ['', Validators.required],
      nit: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: [''],
      password: [''],
      use2fa: [false],
      isActive: [true]
    });
  }

  ngOnInit() {
    if (this.authService.getRoleId() ==1) { 
      this.showActions = true;
    }
    this.loadCommerces();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadCommerces() {
    const headers = this.getHeaders();
    this.http.get<ApiResponse>(this.apiUrl, { headers }).subscribe({
      next: (response) => {
        this.commerces = response.content;
        this.filteredCommerces = response.content;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading commerces:', error);
      }
    });
  }

  searchCommerces() {
    if (!this.searchTerm) {
      this.filteredCommerces = this.commerces;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCommerces = this.commerces.filter(commerce =>
      commerce.name.toLowerCase().includes(term) ||
      commerce.email.toLowerCase().includes(term) ||
      commerce.nit.toLowerCase().includes(term) ||
      commerce.address.toLowerCase().includes(term)
    );
  }

  openEditModal(commerce: Commerce) {
    this.selectedCommerce = commerce;
    this.commerceForm.patchValue({
      name: commerce.name,
      nit: commerce.nit,
      address: commerce.address,
      phoneNumber: commerce.phoneNumber,
      password: '', // No mostrar la contraseña
      use2fa: commerce.use2fa,
      isActive: commerce.isActive
    });
    this.isModalOpen = true;
  }
  /**
   * Abre la vista del reporte de fidelización para el comercio seleccionado.
   * @param commerce El objeto Commerce.
   */
  openFidelizationReport(commerce: Commerce) {
    this.selectedCommerceId = commerce.id;
    this.nameCommerceId = commerce.name;
    this.viewMode = 'report';
  }

  /**
   * Regresa a la vista principal de la tabla de comercios y recarga los datos.
   */
  goBackToTable() {
    this.selectedCommerceId = null;
    this.nameCommerceId = null;
    this.viewMode = 'table';
    this.loadCommerces(); // Recarga para asegurar que cualquier cambio se refleje
  }

  closeModal() {
    this.isModalOpen = false;
    this.commerceForm.reset();
  }

  onSubmit() {
    if (this.commerceForm.valid && this.selectedCommerce) {
      const formData = this.commerceForm.value;
      const headers = this.getHeaders();

      // Construir el payload con solo los campos permitidos
      const updatePayload: any = {
        name: formData.name,
        nit: formData.nit,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        use2fa: formData.use2fa,
        isActive: formData.isActive
      };

      // Añadir la contraseña solo si se proporciona una nueva
      if (formData.password && formData.password.length > 0) {
        updatePayload.password = formData.password;
      }

      this.http.put(`${this.updateUrl}/${this.selectedCommerce.id}`, updatePayload, { headers })
        .subscribe({
          next: () => {
            console.log('Commerce updated successfully');
            this.loadCommerces();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating commerce:', error);
          }
        });
    }
  }
}