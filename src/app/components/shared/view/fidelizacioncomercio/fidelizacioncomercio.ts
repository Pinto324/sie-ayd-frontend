import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router'; // Para obtener el ID de la ruta
import { AuthService } from '../../../../services/auth'; // Asegúrate de que la ruta sea correcta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faRocket,
  faClipboardCheck,
  faBan,
  faMoneyBillWave,
  faPercentage,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

// --- Interfaces de datos de la API ---
interface DeliveryStats {
  totalCount: number;
  totalAmount: number;
  applyPercentage: number;
  subTotalAmount: number;
}

interface FidelizationReport {
  deliveries: DeliveryStats;
  cancelledDeliveries: DeliveryStats;
  fidelizationLevel: string;
  Total: number;
}

@Component({
  selector: 'app-fidelizacioncomercio',
  imports: [CommonModule, FontAwesomeModule, DatePipe, DecimalPipe],
  templateUrl: './fidelizacioncomercio.html',
  styleUrl: './fidelizacioncomercio.css'
})
export class Fidelizacioncomercio implements OnInit {
  
  // Data
  report: FidelizationReport | null = null;
  @Input() commerceId: number | null = null; 
  @Input() name: string | null = null; 
  // Estado de carga y error
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Iconos
  faLevel = faChartLine;
  faDeliveries = faClipboardCheck;
  faCancelled = faBan;
  faAmount = faMoneyBillWave;
  faPercentage = faPercentage;
  faTotal = faRocket;

  // URL de la API
  private apiUrl = 'http://147.135.215.156:8090/api/v1/commerce/fidelizacion'; 


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Simulación: Obtener el ID del comercio de los parámetros de la ruta
    // En un entorno real, la ruta sería /reporte-fidelizacion/:id
    this.route.paramMap.subscribe(params => {
      const id = this.commerceId;
      if (id) {
        this.commerceId = Number(id);
        this.loadFidelizationReport(this.commerceId);
      } else {
        this.errorMessage = 'ID de comercio no proporcionado en la ruta.';
        this.isLoading = false;
      }
    });

  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadFidelizationReport(id: number) {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<FidelizationReport>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        this.report = response;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar el reporte de fidelización:', error);
        this.errorMessage = 'Error al cargar los datos de fidelización. Verifique el ID del comercio y la conexión a la API.';
        this.isLoading = false;
      }
    });
  }
}
