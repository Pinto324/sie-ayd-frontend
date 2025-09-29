import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoxOpen,      // Creada
  faBoxArchive,   // Asignada
  faTruckRampBox, // Recogida
  faTruckFast,    // En ruta
  faCheck,        // Entregada
  faBan,          // Cancelada
  faTimes,        // Rechazada
  faFilePdf 
} from '@fortawesome/free-solid-svg-icons';
import { ExportService } from '../../../services/export.service'; 
import { Alert } from '../alert/alert';
import { AlertType } from '../alert/alert-type.type';
// --- Interfaces (Copied from guia.ts for self-containment) ---

interface Commerce {
  id: number;
  nit: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  member: string;
  address: string;
}

interface Status {
  id: number;
  name: string;
  description: string;
}

interface PackageType {
  id: number;
  name: string;
  description: string;
  basePrice: number;
}

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
  selector: 'app-guiadetalle',
  imports: [CommonModule, FontAwesomeModule, DatePipe],
  templateUrl: './guiadetalle.html',
  styleUrl: './guiadetalle.css'
})
export class Guiadetalle implements OnChanges {
  @Input() guideCode: string | null = null;
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  guideInfo: Guide | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  faFilePdf = faFilePdf;
  private apiUrl = 'http://147.135.215.156:8090/api/v1/guides/search?code=';

  // Iconos y nombres para los estados
  statusIcons: { [key: number]: any } = {
    1: faBoxOpen, 2: faBoxArchive, 3: faTruckRampBox, 4: faTruckFast,
    5: faCheck, 6: faBan, 7: faTimes,
  };

  statusNames: { [key: number]: string } = {
    1: 'Creada', 2: 'Asignada', 3: 'Recogida', 4: 'En ruta',
    5: 'Entregada', 6: 'Cancelada', 7: 'Rechazada',
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService, // <-- Inyección del servicio de exportación
    private alertService: Alert 
  ) { }

  /**
   * Captura los cambios en el Input 'guideCode' y dispara la búsqueda.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['guideCode']) {
      const newCode = changes['guideCode'].currentValue;
      // Solo buscar si el código no es nulo/vacío y ha cambiado
      if (newCode && newCode !== changes['guideCode'].previousValue) {
        this.getGuideInfo(newCode);
      } else if (!newCode) {
        // Limpiar si el código se vuelve nulo/vacío
        this.guideInfo = null;
        this.errorMessage = null;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    }
  }
  downloadGuideDetailsPdf(): void {
    if (!this.guideInfo) {
      this.showAlert('info', 'No hay información de la guía para exportar.');
      return;
    }

    // Solución al problema: ejecuta la lógica de exportación en el siguiente ciclo de la pila
    setTimeout(() => {
        const elementId = 'guide-details-section'; 
        const fileName = `Guia_Detalles_${this.guideInfo!.code}`; // Usamos el ! para asegurar que existe

        // Llama al servicio de exportación
        this.exportService.exportToPdf(elementId, fileName);
          this.showAlert('success', 'Descarga de PDF iniciada.');
    }, 0); 
  }

  getGuideInfo(code: string) {
    this.isLoading = true;
    this.errorMessage = null;
    this.guideInfo = null; // Clear previous info

    // No se necesita el 'AuthService' en este componente ya que el endpoint es público
    this.http.get<Guide>(`${this.apiUrl}${code}`).subscribe({
      next: (response) => {
        this.guideInfo = response;
        this.isLoading = false;
        this.cdr.markForCheck(); // For ChangeDetectionStrategy.OnPush
      },
      error: (error) => {
        console.error('Error fetching guide info:', error);
        this.isLoading = false;
        if (error.status === 404) {
          this.errorMessage = 'No se encontró la guía con el código proporcionado.';
        } else {
          this.errorMessage = 'Ocurrió un error al buscar la guía. Por favor, intenta de nuevo más tarde.';
        }
        this.guideInfo = null;
        this.cdr.markForCheck(); // For ChangeDetectionStrategy.OnPush
      }
    });
  }

  isCurrentStatus(statusId: number): boolean {
    return this.guideInfo?.status.id === statusId;
  }

  isCompletedStatus(): boolean {
  return this.guideInfo?.status.id === 5; // Entregada
}

isCancelledOrRejected(): boolean {
  return this.guideInfo?.status.id === 6 || this.guideInfo?.status.id === 7; // Cancelada o Rechazada
}

getStatusIconClass(statusId: number): string {
  const baseClasses = 'w-10 h-10 md:w-12 md:h-12 p-2 rounded-full transition-all duration-300';
  
  if (this.isCancelledOrRejected()) {
    // Si está cancelada/rechazada, todos en gris excepto el estado actual en rojo
    if (this.isCurrentStatus(statusId)) {
      return `${baseClasses} text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border-2 border-red-600`;
    }
    return `${baseClasses} text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600`;
  }
  
  if (this.isCompletedStatus()) {
    // Si está completada, todos en verde incluyendo el estado actual
    if (this.guideInfo!.status.id >= statusId) {
      return `${baseClasses} text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 border-2 border-green-600`;
    }
    return `${baseClasses} text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600`;
  }
  
  // Comportamiento normal para otros estados
  if (this.isCurrentStatus(statusId)) {
    return `${baseClasses} text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-2 border-blue-600`;
  } else if (this.guideInfo!.status.id > statusId) {
    return `${baseClasses} text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 border-2 border-green-600`;
  } else {
    return `${baseClasses} text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600`;
  }
}

getStatusTextClass(statusId: number): string {
  const baseClasses = 'text-xs md:text-sm text-center mt-2 whitespace-nowrap';
  
  if (this.isCancelledOrRejected()) {
    if (this.isCurrentStatus(statusId)) {
      return `${baseClasses} font-bold text-red-600 dark:text-red-400`;
    }
    return `${baseClasses} text-gray-400 dark:text-gray-500`;
  }
  
  if (this.isCompletedStatus()) {
    if (this.guideInfo!.status.id >= statusId) {
      return `${baseClasses} text-green-600 dark:text-green-400`;
    }
    return `${baseClasses} text-gray-400 dark:text-gray-500`;
  }
  
  // Comportamiento normal
  if (this.isCurrentStatus(statusId)) {
    return `${baseClasses} font-bold text-blue-600 dark:text-blue-400`;
  } else if (this.guideInfo!.status.id > statusId) {
    return `${baseClasses} text-green-600 dark:text-green-400`;
  } else {
    return `${baseClasses} text-gray-400 dark:text-gray-500`;
  }
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
