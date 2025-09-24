import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faSearch } from '@fortawesome/free-solid-svg-icons';

interface PackageType {
  id: number;
  name: string;
  description: string;
  basePrice: number;
}

@Component({
  selector: 'app-paquetes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './paquetes.html',
  styleUrl: './paquetes.css'
})
export class Paquetes implements OnInit {
  packageTypes: PackageType[] = [];
  filteredPackageTypes: PackageType[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  selectedPackageType: PackageType | null = null;
  faEdit = faEdit;
  faSearch = faSearch;
  packageTypeForm: FormGroup;

  private apiUrl = 'http://147.135.215.156:8090/api/v1/package-type';
  private updateUrl = 'http://147.135.215.156:8090/api/v1/package-type';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.packageTypeForm = this.fb.group({
      basePrice: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadPackageTypes();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadPackageTypes() {
    const headers = this.getHeaders();
    this.http.get<PackageType[]>(this.apiUrl, { headers }).subscribe({
      next: (response) => {
        this.packageTypes = response;
        this.filteredPackageTypes = response;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading package types:', error);
      }
    });
  }

  searchPackageTypes() {
    if (!this.searchTerm) {
      this.filteredPackageTypes = this.packageTypes;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPackageTypes = this.packageTypes.filter(type =>
      type.name.toLowerCase().includes(term) ||
      type.description.toLowerCase().includes(term)
    );
  }

  openEditModal(packageType: PackageType) {
    this.selectedPackageType = packageType;
    this.packageTypeForm.patchValue({
      basePrice: packageType.basePrice
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.packageTypeForm.reset();
  }

  onSubmit() {
    if (this.packageTypeForm.valid && this.selectedPackageType) {
      const formData = this.packageTypeForm.value;
      const headers = this.getHeaders();

      const updatePayload = {
        basePrice: Number(formData.basePrice)
      };

      this.http.put(`${this.updateUrl}/${this.selectedPackageType.id}`, updatePayload, { headers })
        .subscribe({
          next: () => {
            console.log('Package type updated successfully');
            this.loadPackageTypes();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating package type:', error);
          }
        });
    }
  }
}