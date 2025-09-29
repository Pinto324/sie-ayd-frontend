// src/app/components/reportes/reporte-comisiones/reporte-comisiones.ts

import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCalendarDays, faSearch, faMoneyBillWave, faUserTie, faCreditCard, faCheckCircle, faFileExport 
} from '@fortawesome/free-solid-svg-icons';

import { ExportService } from '../../../../services/export.service'; 
import { AuthService } from '../../../../services/auth'; 
import { Alert } from '../../../../components/shared/alert/alert';
import { AlertType } from '../../../../components/shared/alert/alert-type.type';
import { CommissionReportItem } from '../../../../interfaces/commission-report.interface'; 
import { ReportCard } from '../../../../components/shared/report-card/report-card'; // Reutilizamos el ReportCard (con algunas modificaciones)


@Component({
  selector: 'app-comisiones',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, DatePipe, DecimalPipe, Alert],
  templateUrl: './comisiones.html',
  styleUrl: './comisiones.css'
})
export class Comisiones implements OnInit {
    isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  reports: CommissionReportItem[] = [];
  isLoading: boolean = false;
  hasSearched: boolean = false; // Para mostrar la tabla solo después de una búsqueda

  // Modelo del formulario de filtro de fechas
  filterData = {
    startDate: '',
    endDate: ''
  };

  // Íconos
  faCalendarDays = faCalendarDays;
  faSearch = faSearch;
  faMoneyBillWave = faMoneyBillWave;
  faUserTie = faUserTie;
  faCreditCard = faCreditCard;
  faCheckCircle = faCheckCircle;
  faFileExport = faFileExport;
  
  private apiUrl = 'http://147.135.215.156:8090/api/v1/commissions';
  reportContainerId = 'commissions-report-container';

  constructor(
    private http: HttpClient,
     private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private alertService: Alert,
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
  loadCommissionReports(): void {
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

    this.http.post<CommissionReportItem[]>(this.apiUrl, payload, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
        this.showAlert('success', `Se cargaron ${data.length} registros de comisiones.`);
      },
      error: (httpError: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error al cargar reportes de comisión:', httpError);
        const errors = this.authService.extractErrorMessages(
          httpError, 
          'Error al intentar cargar el reporte de comisiones.'
        );
        this.showAlert('danger', errors);
      }
    });
  }
  
  // --- MÉTODOS DE EXPORTACIÓN ---

  exportToExcel(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    const dataToExport = this.reports.map(item => ({
        ID_Pago: item.paymentId,
        Código_Referencia: item.referenceCode,
        Repartidor: `${item.user.firstname} ${item.user.lastname}`,
        Email_Repartidor: item.user.email,
        Monto: item.amount,
        Método_Pago: item.paymentMethod,
        Estado: item.status,
        Fecha_Pago: item.paymentDate,
        Comentario: item.comment,
    }));
    
    this.exportService.exportToExcel(dataToExport, `Reporte_Comisiones_${this.filterData.startDate}_a_${this.filterData.endDate}`);
    this.showAlert('success', 'Exportación a Excel iniciada.');
  }

  exportToPdf(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    this.exportService.exportToPdf(this.reportContainerId, `Reporte_Comisiones_PDF_${this.filterData.startDate}_a_${this.filterData.endDate}`);
    this.showAlert('success', 'Exportación a PDF iniciada.');
  }

  exportToImage(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    this.exportService.exportToImage(this.reportContainerId, `Reporte_Comisiones_IMG_${this.filterData.startDate}_a_${this.filterData.endDate}`);
    this.showAlert('success', 'Exportación a Imagen iniciada.');
  }
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
