import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faEdit, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
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
  selector: 'app-guias',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, DatePipe],
  templateUrl: './guias.html',
  styleUrl: './guias.css'
})
export class Guias {
  guides: Guide[] = [];
  filteredGuides: Guide[] = [];
  packageTypes: PackageType[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  isEditMode = false;
  selectedGuide: Guide | null = null;
  faPlus = faPlus;
  faEdit = faEdit;
  faTimes = faTimes;
  faSearch = faSearch;
  guideForm: FormGroup;

  private guidesApiUrl = 'http://147.135.215.156:8090/api/v1/guides';
  private packageTypeApiUrl = 'http://147.135.215.156:8090/api/v1/package-type';
  private cancelGuideUrl = 'http://147.135.215.156:8090/api/v1/guides/cancel';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.guideForm = this.fb.group({
      packageId: ['', Validators.required],
      recipientName: ['', Validators.required],
      recipientAddress: ['', Validators.required],
      recipientPhone: [''],
      recipientEmail: ['', [Validators.required, Validators.email]],
      packageDescription: ['']
    });
  }

  ngOnInit() {
    this.loadGuides();
    this.loadPackageTypes();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadGuides() {
    const headers = this.getHeaders();
    this.http.get<Guide[]>(this.guidesApiUrl, { headers }).subscribe({
      next: (response) => {
        this.guides = response;
        this.filteredGuides = response;
        console.log(this.guides);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading guides:', error);
      }
    });
  }

  loadPackageTypes() {
    const headers = this.getHeaders();
    this.http.get<PackageType[]>(this.packageTypeApiUrl, { headers }).subscribe({
      next: (response) => {
        this.packageTypes = response;
      },
      error: (error) => {
        console.error('Error loading package types:', error);
      }
    });
  }

  searchGuides() {
    if (!this.searchTerm) {
      this.filteredGuides = this.guides;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredGuides = this.guides.filter(guide =>
      guide.code.toLowerCase().includes(term) ||
      guide.recipient.toLowerCase().includes(term) ||
      guide.type.name.toLowerCase().includes(term)
    );
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedGuide = null;
    this.guideForm.reset();
    this.isModalOpen = true;
  }

  openEditModal(guide: Guide) {
    this.isEditMode = true;
    this.selectedGuide = guide;
    this.guideForm.patchValue({
      packageId: guide.type.id,
      recipientName: guide.recipient,
      recipientAddress: guide.address,
      recipientPhone: guide.phone,
      recipientEmail: guide.email,
      packageDescription: guide.description
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.guideForm.reset();
  }

  onSubmit() {
    if (this.guideForm.valid) {
      const formData = this.guideForm.value;
      const headers = this.getHeaders();
      const payload = {
        packageId: Number(formData.packageId),
        recipientName: formData.recipientName,
        recipientAddress: formData.recipientAddress,
        recipientPhone: formData.recipientPhone,
        recipientEmail: formData.recipientEmail,
        packageDescription: formData.packageDescription
      };

      if (this.isEditMode && this.selectedGuide) {
        // Lógica para editar
        this.http.put(`${this.guidesApiUrl}/${this.selectedGuide.id}`, payload, { headers })
          .subscribe({
            next: () => {
              this.loadGuides();
              this.closeModal();
            },
            error: (error) => {
              console.error('Error updating guide:', error);
            }
          });
      } else {
        // Lógica para crear
        this.http.post(this.guidesApiUrl, payload, { headers })
          .subscribe({
            next: () => {
              console.log('Guide created successfully');
              this.loadGuides();
              this.closeModal();
            },
            error: (error) => {
              console.error('Error creating guide:', error);
            }
          });
      }
    }
  }

  cancelGuide(guide: Guide) {
    if (confirm(`¿Estás seguro de que quieres cancelar la guía con código ${guide.code}?`)) {
      const headers = this.getHeaders();
      this.http.put(`${this.cancelGuideUrl}/${guide.id}`, {}, { headers }).subscribe({
        next: () => {
          console.log('Guide cancelled successfully');
          this.loadGuides();
        },
        error: (error) => {
          console.error('Error cancelling guide:', error);
        }
      });
    }
  }

  canEditOrCancel(statusId: number): boolean {
    return statusId === 1 || statusId === 2;
  }
}