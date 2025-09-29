import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTag, faStore, faUser, faMapMarkerAlt, faTruck, faDollarSign, faClock } from '@fortawesome/free-solid-svg-icons';
import { DeliveryReportItem } from '../../../interfaces/delivery-report.interface'; 
@Component({
  selector: 'app-report-card',
  imports: [CommonModule, FontAwesomeModule, DatePipe, DecimalPipe],
  templateUrl: './report-card.html',
  styleUrl: './report-card.css'
})
export class ReportCard {
  @Input() reportItem!: DeliveryReportItem;
  
  // Íconos
  faTag = faTag;
  faStore = faStore;
  faUser = faUser;
  faMapMarkerAlt = faMapMarkerAlt;
  faTruck = faTruck;
  faDollarSign = faDollarSign;
  faClock = faClock;

  get assignedToName(): string {
    if (!this.reportItem.assignedTo) return 'Sin asignar';
    const { firstname, lastname } = this.reportItem.assignedTo;
    return `${firstname} ${lastname}`;
  }

  /**
   * Proporciona clases de color según el estado para hacerlo visualmente llamativo.
   */
  getStatusClass(statusName: string): string {
    switch (statusName) {
      case 'Entregada': return 'text-green-800 bg-green-100 dark:bg-green-800 dark:text-green-300';
      case 'Pendiente': return 'text-yellow-800 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-300';
      case 'Rechazada': return 'text-red-800 bg-red-100 dark:bg-red-800 dark:text-red-300';
      case 'En Tránsito': return 'text-blue-800 bg-blue-100 dark:bg-blue-800 dark:text-blue-300';
      default: return 'text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}
