import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth'; // Asegúrate de que la ruta sea correcta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

// Importa el componente de vista compartida
import { Fidelizacioncomercio } from '../../../components/shared/view/fidelizacioncomercio/fidelizacioncomercio'; 
import { Alert } from '../../../components/shared/alert/alert'; // Importa el componente Alert
import { AlertType } from '../../../components/shared/alert/alert-type.type';

// Interfaces mínimas para las respuestas de la API
interface CommerceIdResponse {
  commerceId: number;
}

interface CommerceDetail {
  id: number;
  name: string;
  // ... otras propiedades no necesarias para esta vista
}

@Component({
  selector: 'app-fidelizacion',
  imports: [CommonModule, 
    FontAwesomeModule, 
    Fidelizacioncomercio, // Componente de reporte compartido
    Alert],
  templateUrl: './fidelizacion.html',
  styleUrl: './fidelizacion.css'
})
export class fidelizacioncomercio implements OnInit {
  // Datos a pasar al componente hijo
  commerceId: number | null = null;
  commerceName: string | null = null;
  
  // Estado de carga y error
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Estado de la Alerta
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';

  faChartLine = faChartLine;

  // URLs de la API
  private getCommerceIdUrl = 'http://147.135.215.156:8090/api/v1/commerce/id';
  private getCommerceDetailUrl = 'http://147.135.215.156:8090/api/v1/commerce'; 

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchCommerceData();
  }

  private getJsonHeaders(): HttpHeaders { 
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });
  }

  /**
   * Proceso de carga de datos para el usuario Comercio:
   * 1. Obtener el userId del servicio de autenticación.
   * 2. Usar el userId para obtener el commerceId.
   * 3. Usar el commerceId para obtener el nombre del comercio.
   */
  fetchCommerceData() {
    this.isLoading = true;
    this.errorMessage = null;
    const userId = this.authService.getUserId(); // Asumiendo que existe un método para obtener el ID de usuario

    if (!userId) {
      this.errorMessage = 'No se pudo obtener el ID del usuario. Por favor, inicie sesión nuevamente.';
      this.isLoading = false;
      return;
    }

    // 1. Obtener el commerceId usando el userId
    this.http.get<CommerceIdResponse>(`${this.getCommerceIdUrl}/${userId}`, { headers: this.getJsonHeaders() }).subscribe({
      next: (response) => {
        this.commerceId = response.commerceId;
        // 2. Obtener el nombre del comercio usando el commerceId
        this.fetchCommerceName(this.commerceId);
      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al obtener el ID de comercio. Asegúrese de que su cuenta de usuario esté vinculada a un comercio.'
                );
        this.errorMessage = errors.join('. ');
        this.isLoading = false;
      }
    });
  }

  fetchCommerceName(id: number) {
    // 3. Obtener los detalles del comercio (principalmente el nombre)
    this.http.get<CommerceDetail>(`${this.getCommerceDetailUrl}/${id}`, { headers: this.getJsonHeaders() }).subscribe({
      next: (response) => {
        this.commerceName = response.name;
        this.isLoading = false;
        this.cdr.markForCheck(); // Forzar la detección de cambios para renderizar el componente hijo
      },
      error: (httpError) => {
        const errors: string[] = this.authService.extractErrorMessages(
                    httpError, 
                    'Error al obtener el nombre del comercio.'
                );
        this.errorMessage = errors.join('. ');
        this.isLoading = false;
      }
    });
  }

  // --- Lógica de Alerts (Necesaria si el componente hijo usa alertas o si ocurre un error) ---

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