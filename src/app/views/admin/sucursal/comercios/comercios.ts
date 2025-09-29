import { ChangeDetectorRef, Component, OnInit, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faSearch, faChartLine, faArrowLeft, faFileInvoiceDollar, faStore, faBan } from '@fortawesome/free-solid-svg-icons';
import { Fidelizacioncomercio } from '../../../../components/shared/view/fidelizacioncomercio/fidelizacioncomercio';

// Importar componentes compartidos
import { Table, TableColumn, TableAction } from '../../../../components/shared/table/table';
import { Searchtable } from '../../../../components/shared/searchtable/searchtable'; 
import { Alert } from '../../../../components/shared/alert/alert'; 

// Nuevo Componente
import { Caja } from '../../../../components/shared/view/caja/caja'; 

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
  // Añadido logo para el requerimiento
  logo: string; 
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule,Table ,Searchtable,FontAwesomeModule,Fidelizacioncomercio,Caja,Alert],
  templateUrl: './comercios.html',
  styleUrl: './comercios.css'
})
export class Comercios implements OnInit {
  
  // -- Propiedades para la Tabla (Nuevas) --
  commerces: Commerce[] = [];
  filteredCommerces: Commerce[] = [];
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];
  searchTerm: string = '';
  
  // -- Propiedades de Vista y Estado --
  viewMode: 'table' | 'edit' | 'fidelizacion' | 'caja' = 'table'; 
  isModalOpen: boolean = false; 
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // -- Propiedades para Vistas Secundarias --
  selectedCommerce: Commerce | null = null;
  selectedCommerceId: number | null = null;
  nameCommerceId: string | null = null; 
  commerceForCajaId: number | undefined; // ID para el componente Caja

  // ... (URLS y Formulario de Edición existentes)
  private apiUrl = 'http://147.135.215.156:8090/api/v1/commerce?page=0&size=10000';
  private updateUrl = 'http://147.135.215.156:8090/api/v1/commerce';
  commerceForm!: FormGroup;

  // -- Íconos --
  faEdit = faEdit;
  faSearch = faSearch;
  faChartLine = faChartLine;
  faArrowLeft = faArrowLeft;
  faFileInvoiceDollar = faFileInvoiceDollar; 
  faStore = faStore;
  faBan = faBan;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.configureTableColumns();
    this.configureTableActions();
    this.loadCommerces();
  }
  
  // ... (initForm, getHeaders, loadCommerces, searchCommerces - Lógica de carga/filtrado existente)
  private initForm() {
    this.commerceForm = this.fb.group({
        name: ['', Validators.required],
        nit: ['', Validators.required],
        address: ['', Validators.required],
        phoneNumber: ['', Validators.required],
        use2fa: [false],
        isActive: [false],
        password: [''] 
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  loadCommerces() {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<ApiResponse>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        this.commerces = response.content.map(c => ({
            ...c,
            // Asumo que el logo viene en el objeto, si no, se usa una cadena vacía
            logo: (c as any).logo || '' 
        })); 
        this.filteredCommerces = this.commerces;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (httpError) => {
        this.isLoading = false;
        // Asumiendo que esta función de manejo de errores existe en tu AuthService
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al cargar comercios. Por favor, intente de nuevo.'
                );
        this.errorMessage = errors.join('. ');
        this.cdr.markForCheck();
      }
    });
  }
  
  searchCommerces() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredCommerces = this.commerces;
    } else {
      this.filteredCommerces = this.commerces.filter(commerce => 
        commerce.name.toLowerCase().includes(term) ||
        commerce.nit.toLowerCase().includes(term) ||
        commerce.email.toLowerCase().includes(term)
      );
    }
    this.cdr.markForCheck();
  }

  // --- Configuración y Lógica de la Nueva Tabla ---
  configureTableColumns() {
    this.tableColumns = [
      { key: 'id', header: 'ID', type: 'text' },
      { key: 'logo', header: 'Logo', type: 'custom' }, 
      { key: 'name', header: 'Nombre', type: 'text' },
      { key: 'nit', header: 'NIT', type: 'text' },
      { key: 'email', header: 'Email', type: 'text' },
      { key: 'phoneNumber', header: 'Teléfono', type: 'text' },
      // Ejemplo de uso de iconStatus:
      { key: 'isActive', header: 'Estado', type: 'iconStatus' }
    ];
  }

  configureTableActions() {
    this.tableActions = [
      {
        label: 'Editar',
        icon: this.faEdit,
        action: 'edit',
        class: 'px-3 py-1 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors'
      },
      {
        label: 'Fidelización',
        icon: this.faChartLine,
        action: 'fidelizacion',
        class: 'px-3 py-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors'
      },
      // ¡NUEVA ACCIÓN!
      {
        label: 'Cierre de Caja',
        icon: this.faFileInvoiceDollar,
        action: 'caja',
        class: 'px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors'
      }
    ];
  }

  handleTableAction(event: { action: string, item: any }) {
    const commerce = event.item as Commerce;
    switch (event.action) {
      case 'edit':
        this.openEditModal(commerce);
        break;
      case 'fidelizacion':
        this.viewFidelizacion(commerce);
        break;
      case 'caja':
        this.viewCaja(commerce);
        break;
      default:
        console.warn('Acción no reconocida:', event.action);
    }
  }

  viewCaja(commerce: Commerce) {
    this.commerceForCajaId = commerce.id;
    this.viewMode = 'caja';
  }
  
  viewFidelizacion(commerce: Commerce) {
    this.selectedCommerceId = commerce.id;
    this.nameCommerceId = commerce.name;
    this.viewMode = 'fidelizacion';
  }

  /**
   * Regresa a la vista principal de la tabla de comercios y recarga los datos.
   */
  goBackToTable() {
    this.selectedCommerceId = null;
    this.nameCommerceId = null;
    this.commerceForCajaId = undefined; 
    this.viewMode = 'table';
    this.loadCommerces(); 
  }

 openEditModal(commerce: Commerce) {
    this.selectedCommerce = commerce;
    this.isModalOpen = true;
    this.commerceForm.patchValue({
      name: commerce.name,
      nit: commerce.nit,
      address: commerce.address,
      phoneNumber: commerce.phoneNumber,
      use2fa: commerce.use2fa,
      isActive: commerce.isActive,
      password: '' 
    });
  }
  
  closeModal() {
    this.isModalOpen = false;
    this.commerceForm.reset();
  }
  
  onSubmit() {
    if (this.commerceForm.valid && this.selectedCommerce) {
      const formData = this.commerceForm.value;
      const headers = this.getHeaders();
      const updatePayload: any = {
        name: formData.name,
        nit: formData.nit,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        use2fa: formData.use2fa,
        isActive: formData.isActive
      };

      if (formData.password && formData.password.length > 0) {
        updatePayload.password = formData.password;
      }

      this.http.put(`${this.updateUrl}/${this.selectedCommerce.id}`, updatePayload, { headers })
        .subscribe({
          next: () => {
            this.loadCommerces();
            this.closeModal();
            this.cdr.markForCheck();
          },
          error: (httpError) => {
            // Lógica de manejo de errores
          }
        });
    }
  }
  statusIconMap = {
  // Las claves deben coincidir con los posibles valores de la propiedad 'isActive'
  // En JavaScript, los booleanos en un objeto se manejan como strings 'true'/'false'.
  'true': this.faStore,
  'false': this.faBan
};
}