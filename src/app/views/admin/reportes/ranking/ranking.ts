import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCalendarDays, faSearch, faTrophy, faTruck, faBuilding, faMapMarkerAlt, faIdCard, faUserTie, faFileExport 
} from '@fortawesome/free-solid-svg-icons';

import { ExportService } from '../../../../services/export.service'; 
import { AuthService } from '../../../../services/auth'; 
import { Alert } from '../../../../components/shared/alert/alert';
import { AlertType } from '../../../../components/shared/alert/alert-type.type';
import { RankingReportItem } from '../../../../interfaces/ranking-report.interface'; 

@Component({
  selector: 'app-ranking',
  imports: [CommonModule, FormsModule, FontAwesomeModule, DatePipe, DecimalPipe,Alert],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css'
})
export class Ranking implements OnInit {
  
  reports: RankingReportItem[] = [];
  isLoading: boolean = false;
  hasSearched: boolean = false;

  // Modelo del formulario de filtro de fechas
  filterData = {
    startDate: '',
    endDate: ''
  };

  // Íconos
  faCalendarDays = faCalendarDays;
  faSearch = faSearch;
  faTrophy = faTrophy;
  faTruck = faTruck;
  faBuilding = faBuilding;
  faMapMarkerAlt = faMapMarkerAlt;
  faIdCard = faIdCard;
  faUserTie = faUserTie;
  faFileExport = faFileExport;
  
  private apiUrl = 'http://147.135.215.156:8090/api/v1/ranking-commerces';
  reportContainerId = 'ranking-report-container';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    // Inicializa las fechas con el mes actual
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Formatea a YYYY-MM-DD
    this.filterData.startDate = this.formatDate(firstDay);
    this.filterData.endDate = this.formatDate(today);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Ejecuta la llamada POST a la API para obtener el reporte.
   */
  loadRankingReports(): void {
    if (!this.filterData.startDate || !this.filterData.endDate) {
        this.showAlert('info', 'Debes seleccionar una fecha de inicio y una fecha de fin.');
        return;
    }
    
    this.isLoading = true;
    this.hasSearched = true;
    this.reports = []; // Limpia resultados anteriores

    const payload = {
        startDate: this.filterData.startDate,
        endDate: this.filterData.endDate
    };

    this.http.post<RankingReportItem[]>(this.apiUrl, payload, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        // Ordena los datos de mayor a menor volumen (entregas)
        this.reports = data.sort((a, b) => b.deliveries - a.deliveries);
        this.isLoading = false;
        this.showAlert('success', `Se cargaron ${data.length} comercios para el ranking.`);
      },
      error: (httpError: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error al cargar reporte de ranking:', httpError);
        const errors = this.authService.extractErrorMessages(
          httpError, 
          'Error al intentar cargar el ranking de comercios.'
        );
        this.showAlert('danger', errors);
      }
    });
  }

  // Calcula el ancho de la barra para cada comercio basado en el volumen máximo
  getBarWidth(deliveries: number): string {
    if (this.reports.length === 0) return '0%';
    const maxDeliveries = this.reports[0].deliveries; // El primero (ya ordenado) es el máximo
    return `${(deliveries / maxDeliveries) * 100}%`;
  }
  
  // --- MÉTODOS DE EXPORTACIÓN ---

  exportToExcel(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    const dataToExport = this.reports.map((item, index) => ({
        Ranking: index + 1,
        Nombre_Comercio: item.firstname, // Usamos firstname como nombre del comercio si no hay campo 'name'
        NIT: item.nit,
        Dirección: item.address,
        Volumen_Entregas: item.deliveries,
    }));
    
    this.exportService.exportToExcel(dataToExport, `Ranking_Comercios_${this.filterData.startDate}_a_${this.filterData.endDate}`);
    this.showAlert('success', 'Exportación a Excel iniciada.');
  }

  exportToPdf(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    setTimeout(() => {
        this.exportService.exportToPdf(this.reportContainerId, `Ranking_Comercios_PDF_${this.filterData.startDate}_a_${this.filterData.endDate}`);
        this.showAlert('info', 'Exportación a PDF iniciada.');
    }, 0);
  }

  exportToImage(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    setTimeout(() => {
        this.exportService.exportToImage(this.reportContainerId, `Ranking_Comercios_IMG_${this.filterData.startDate}_a_${this.filterData.endDate}`);
        this.showAlert('success', 'Exportación a Imagen iniciada.');
    }, 0);
  }
        isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
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