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
  faTimes         // Rechazada
} from '@fortawesome/free-solid-svg-icons';

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

  guideInfo: Guide | null = null;
  isLoading = false;
  errorMessage: string | null = null;

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
}
