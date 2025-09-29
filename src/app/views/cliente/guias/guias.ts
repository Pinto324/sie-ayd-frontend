import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// Asegúrate de que esta ruta sea correcta para tu servicio de autenticación
import { AuthService } from '../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faSearch, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

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
  imports: [CommonModule, DatePipe, DecimalPipe, FontAwesomeModule, Searchtable, Table, Guiadetalle],
  templateUrl: './guias.html',
  styleUrl: './guias.css'
})
export class GuiasCliente implements OnInit {
  // Datos y Estados
  guides: Guide[] = [];
  filteredGuides: Guide[] = [];
  searchTerm: string = '';
  isLoadingData: boolean = true;

  // Control de Vista
  showDetailView: boolean = false; // TRUE: Muestra el detalle; FALSE: Muestra la tabla
  selectedGuideCode: string | null = null; // Código de la guía a mostrar en el detalle

  // Íconos
  faSearch = faSearch;
  faEye = faEye;
  faArrowLeft = faArrowLeft;

  // Endpoint API
  private guidesApiUrl = 'http://147.135.215.156:8090/api/v1/guides';

  // --- Configuración para TablaComponent ---
  tableColumns: TableColumn[] = [
    { key: 'code', header: 'Código', type: 'text' },
    { key: 'commerce.name', header: 'Comercio', type: 'nested', nestedKey: 'name' },
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
  ];
  // ----------------------------------------

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
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
    }
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
}
