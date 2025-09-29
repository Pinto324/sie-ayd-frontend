import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ReportCard } from '../../../../components/shared/report-card/report-card';
import { DeliveryReportItem } from '../../../../interfaces/delivery-report.interface'; 
import { AuthService } from '../../../../services/auth'; 
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ExportService } from '../../../../services/export.service';
import { Alert } from '../../../../components/shared/alert/alert';
import { AlertType } from '../../../../components/shared/alert/alert-type.type';
@Component({
  selector: 'app-entregas',
  imports: [CommonModule, ReportCard, DatePipe, DecimalPipe, FontAwesomeModule,Alert],
  templateUrl: './entregas.html',
  styleUrl: './entregas.css'
})
export class Entregas  implements OnInit {
  private reportContainerId = 'report-container'; 
  reports: DeliveryReportItem[] = [];
  isLoading: boolean = true;
  faFileExport = faFileExport;
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  private apiUrl = 'http://147.135.215.156:8090/api/v1/delivery-reports';
  
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private exportService: ExportService 
  ) {}

  ngOnInit(): void {
    this.loadDeliveryReports();
  }
  
  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  loadDeliveryReports(): void {
    this.isLoading = true;
    this.http.get<DeliveryReportItem[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.reports = data;
        console.log(data);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (httpError: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error al cargar reportes de entrega:', httpError);
      }
    });
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

  // --- MÉTODOS DE EXPORTACIÓN PENDIENTES ---
  // Estos métodos llamarán al ExportService (que implementarás luego)
exportToExcel(): void {
    const dataToExport = this.reports.map(item => ({
        Código: item.code,
        Estado: item.status.name,
        Comercio: item.commerce.name,
        Destinatario: item.recipient,
        Precio: item.price,
        AsignadoA: item.assignedTo ? `${item.assignedTo.firstname} ${item.assignedTo.lastname}` : 'Sin asignar',
        FechaEntrega: item.deliveryDate,
    }));
    
    this.exportService.exportToExcel(dataToExport, 'Reporte_Entregas');
    this.showAlert('success', 'Exportación a Excel iniciada.');
  }

  exportToPdf(): void {
    this.exportService.exportToPdf(this.reportContainerId, 'Reporte_Entregas_PDF');
    this.showAlert('success', 'Exportación a PDF iniciada.');
  }

  exportToImage(): void {
    this.exportService.exportToImage(this.reportContainerId, 'Reporte_Entregas_IMG');
    this.showAlert('success', 'Exportación a Imagen iniciada.');
  }
}