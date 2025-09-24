import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faSearch } from '@fortawesome/free-solid-svg-icons';

// Interfaz para la estructura de la regla de lealtad
interface LoyaltyRule {
  id: number;
  loyaltyName: string;
  minDeliveries: number;
  maxDeliveries: number;
  discountPercentage: number;
  freeCancellations: number;
  cancellationPercentage: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-fidelizacion',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './fidelizacion.html',
  styleUrl: './fidelizacion.css'
})
export class Fidelizacion {
  loyaltyRules: LoyaltyRule[] = [];
  filteredLoyaltyRules: LoyaltyRule[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  selectedLoyaltyRule: LoyaltyRule | null = null;
  faEdit = faEdit;
  faSearch = faSearch;
  loyaltyRuleForm: FormGroup;

  private apiUrl = 'http://147.135.215.156:8090/api/v1/loyalty-rules';
  private updateUrl = 'http://147.135.215.156:8090/api/v1/loyalty-rules';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.loyaltyRuleForm = this.fb.group({
      minDeliveries: [null, [Validators.required, Validators.min(0)]],
      maxDeliveries: [null, [Validators.required, Validators.min(0)]],
      discountPercentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      freeCancellations: [null, [Validators.required, Validators.min(0)]],
      cancellationPercentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit() {
    this.loadLoyaltyRules();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadLoyaltyRules() {
    const headers = this.getHeaders();
    this.http.get<LoyaltyRule[]>(this.apiUrl, { headers }).subscribe({
      next: (response) => {
        this.loyaltyRules = response;
        this.filteredLoyaltyRules = response;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading loyalty rules:', error);
      }
    });
  }

  searchLoyaltyRules() {
    if (!this.searchTerm) {
      this.filteredLoyaltyRules = this.loyaltyRules;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredLoyaltyRules = this.loyaltyRules.filter(rule =>
      rule.loyaltyName.toLowerCase().includes(term)
    );
  }

  openEditModal(loyaltyRule: LoyaltyRule) {
    this.selectedLoyaltyRule = loyaltyRule;
    this.loyaltyRuleForm.patchValue({
      minDeliveries: loyaltyRule.minDeliveries,
      maxDeliveries: loyaltyRule.maxDeliveries,
      discountPercentage: loyaltyRule.discountPercentage,
      freeCancellations: loyaltyRule.freeCancellations,
      cancellationPercentage: loyaltyRule.cancellationPercentage
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.loyaltyRuleForm.reset();
  }

  onSubmit() {
    if (this.loyaltyRuleForm.valid && this.selectedLoyaltyRule) {
      const formData = this.loyaltyRuleForm.value;
      const headers = this.getHeaders();

      const updatePayload = {
        minDeliveries: Number(formData.minDeliveries),
        maxDeliveries: Number(formData.maxDeliveries),
        discountPercentage: Number(formData.discountPercentage),
        freeCancellations: Number(formData.freeCancellations),
        cancellationPercentage: Number(formData.cancellationPercentage)
      };

      this.http.put(`${this.updateUrl}/${this.selectedLoyaltyRule.id}`, updatePayload, { headers })
        .subscribe({
          next: () => {
            console.log('Loyalty rule updated successfully');
            this.loadLoyaltyRules();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating loyalty rule:', error);
          }
        });
    }
  }
}