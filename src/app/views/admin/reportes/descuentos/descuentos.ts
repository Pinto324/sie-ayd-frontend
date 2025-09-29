import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faTags, faLevelUpAlt, faStore, faCheckCircle, faFileExport, faTruck, faBan, faDollarSign 
} from '@fortawesome/free-solid-svg-icons';

import { ExportService } from '../../../../services/export.service'; 
import { AuthService } from '../../../../services/auth'; 
import { Alert } from '../../../../components/shared/alert/alert';
import { AlertType } from '../../../../components/shared/alert/alert-type.type';
import { DiscountReportItem } from '../../../../interfaces/discount-report.interface'; 


@Component({
  selector: 'app-descuentos',
  imports: [CommonModule, FormsModule, FontAwesomeModule, DatePipe, DecimalPipe,Alert],
  templateUrl: './descuentos.html',
  styleUrl: './descuentos.css'
})
export class Descuentos implements OnInit {
  
  reports: DiscountReportItem[] = [];
  isLoading: boolean = true;
  
  // Íconos
  faTags = faTags;
  faLevelUpAlt = faLevelUpAlt;
  faStore = faStore;
  faCheckCircle = faCheckCircle;
  faFileExport = faFileExport;
  faTruck = faTruck;
  faBan = faBan;
  faDollarSign = faDollarSign;

  private apiUrl = 'http://147.135.215.156:8090/api/v1/discounts';
  reportContainerId = 'discounts-report-container';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private alertService: Alert,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadDiscountReports();
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  loadDiscountReports(): void {
    this.isLoading = true;
    
    this.http.get<DiscountReportItem[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        console.log(data);
        this.reports = data;
        this.isLoading = false;
        this.showAlert('success', `Se cargaron ${data.length} registros de descuentos.`);
      },
      error: (httpError: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error al cargar reportes de descuentos:', httpError);
        const errors = this.authService.extractErrorMessages(
          httpError, 
          'Error al intentar cargar el reporte de descuentos.'
        );
        this.showAlert('danger', errors);
      }
    });
  }

  // Métodos para asignar clases CSS según el nivel de fidelización (para hacerlo llamativo)
  getLevelClass(level: string): string {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold uppercase';
    switch (level.toUpperCase()) {
      case 'ORO': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300`;
      case 'PLATA': return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
      case 'BRONCE': return `${base} bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-300`;
      default: return `${base} bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300`;
    }
  }
  
  // --- MÉTODOS DE EXPORTACIÓN ---

  exportToExcel(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    const dataToExport = this.reports.map(item => ({
        ID: item.id,
        Comercio: item.commerce.name,
        Nivel_Fidelización: item.fidelizationLevel,
        Entregas_Total: item.deliveriesTotalCount,
        Entregas_Monto_Bruto: item.deliveriesTotalAmount,
        Entregas_Descuento_Pct: `${item.deliveriesApplyPercentage}%`,
        Entregas_Monto_Neto: item.deliveriesSubTotalAmount,
        Canceladas_Total: item.cancelledTotalCount,
        Canceladas_Monto_Bruto: item.cancelledTotalAmount,
        Canceladas_Descuento_Pct: `${item.cancelledApplyPercentage}%`,
        Canceladas_Monto_Neto: item.cancelledSubTotalAmount,
        Monto_Total_Aplicado: item.totalAmount,
        Estado: item.status,
        Fecha_Registro: item.createdDate,
    }));
    
    this.exportService.exportToExcel(dataToExport, 'Reporte_Descuentos_Fidelizacion');
    this.showAlert('success', 'Exportación a Excel iniciada.');
  }

  exportToPdf(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    // Usamos setTimeout(0) como precaución para el DOM
    setTimeout(() => {
        this.exportService.exportToPdf(this.reportContainerId, 'Reporte_Descuentos_Fidelizacion_PDF');
        this.showAlert('success', 'Exportación a PDF iniciada.');
    }, 0);
  }

  exportToImage(): void {
    if (this.reports.length === 0) {
      this.showAlert('info', 'No hay datos para exportar.');
      return;
    }
    setTimeout(() => {
        this.exportService.exportToImage(this.reportContainerId, 'Reporte_Descuentos_Fidelizacion_IMG');
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
