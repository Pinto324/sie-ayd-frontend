import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faTimesCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
interface CommerceRequest {
  id: number;
  nit: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  member: string;
  address: string;
}
interface ApiResponse {
  content: CommerceRequest[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
@Component({
  selector: 'app-solicitud',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './solicitud.html',
  styleUrl: './solicitud.css'
})
export class Solicitud implements OnInit {
  requests: CommerceRequest[] = [];
  filteredRequests: CommerceRequest[] = [];
  searchTerm: string = '';
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faSearch = faSearch;

  private apiUrl = 'http://147.135.215.156:8090/api/v1/commerce/request?page=0&size=10';
  private acceptUrl = 'http://147.135.215.156:8090/api/v1/commerce';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCommerceRequests();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadCommerceRequests() {
    const headers = this.getHeaders();
    this.http.get<ApiResponse>(this.apiUrl, { headers }).subscribe({
      next: (response) => {
        this.requests = response.content;
        this.filteredRequests = response.content;
        console.log('Commerce requests loaded successfully:', this.requests);
        this.cdr.markForCheck(); 
      },
      error: (error) => {
        console.error('Error loading commerce requests:', error);
      }
    });
  }

  searchRequests() {
    if (!this.searchTerm) {
      this.filteredRequests = this.requests;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredRequests = this.requests.filter(request =>
      request.name.toLowerCase().includes(term) ||
      request.email.toLowerCase().includes(term) ||
      request.phoneNumber.includes(term) ||
      request.nit.includes(term)
    );
  }

  acceptRequest(request: CommerceRequest) {
    if (confirm(`¿Estás seguro de que quieres aceptar a ${request.name}?`)) {
      const headers = this.getHeaders();
      const payload = { isMember: true };
      
      this.http.post(`${this.acceptUrl}/${request.id}`, payload, { headers }).subscribe({
        next: () => {
          console.log(`Request for ${request.name} accepted.`);
          // Reload the list to remove the accepted request from the table
          this.loadCommerceRequests();
        },
        error: (error) => {
          console.error('Error accepting commerce request:', error);
        }
      });
    }
  }

  // Se podría agregar una función similar para rechazar, si es necesario
  rejectRequest(request: CommerceRequest) {
    if (confirm(`¿Estás seguro de que quieres rechazar a ${request.name}?`)) {
      // Lógica para rechazar
      const headers = this.getHeaders();
      const payload = { isMember: false };
      
      this.http.post(`${this.acceptUrl}/${request.id}`, payload, { headers }).subscribe({
        next: () => {
          console.log(`Request for ${request.name} rejected.`);
          this.loadCommerceRequests();
        },
        error: (error) => {
          console.error('Error rejecting commerce request:', error);
        }
      });
    }
  }
}
