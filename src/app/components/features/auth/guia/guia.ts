import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faBoxOpen,      // Creada
  faBoxArchive,   // Asignada
  faTruckRampBox, // Recogida
  faTruckFast,    // En ruta
  faCheck,        // Entregada
  faBan,          // Cancelada
  faTimes         // Rechazada
} from '@fortawesome/free-solid-svg-icons';

// Interfaces para la estructura de los datos de la API
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
  selector: 'app-guia',
  imports: [CommonModule, FormsModule, FontAwesomeModule, DatePipe],
  templateUrl: './guia.html',
  styleUrl: './guia.css'
})
export class Guia implements OnInit {
  guideCode: string = '';
  guideInfo: Guide | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  faSearch = faSearch;

  // Iconos para los estados
  statusIcons: { [key: number]: any } = {
    1: faBoxOpen,
    2: faBoxArchive,
    3: faTruckRampBox,
    4: faTruckFast,
    5: faCheck,
    6: faBan,
    7: faTimes,
  };

  statusNames: { [key: number]: string } = {
    1: 'Creada',
    2: 'Asignada',
    3: 'Recogida',
    4: 'En ruta',
    5: 'Entregada',
    6: 'Cancelada',
    7: 'Rechazada',
  };

  private apiUrl = 'http://147.135.215.156:8090/api/v1/guides/search?code=';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() { }


  getGuideInfo() {
    if (!this.guideCode) {
      this.errorMessage = 'Por favor, introduce un código de guía.';
      this.guideInfo = null;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<Guide>(`${this.apiUrl}${this.guideCode}`).subscribe({
      next: (response) => {
        console.log(response);
        this.guideInfo = response;
        this.isLoading = false;
        this.cdr.markForCheck();
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
      }
    });
  }

  isCurrentStatus(statusId: number): boolean {
    return this.guideInfo?.status.id === statusId;
  }
}