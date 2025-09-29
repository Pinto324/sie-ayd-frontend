import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth'; // Asegura la ruta correcta
import { Alert } from '../../alert/alert'; // Asegura la ruta correcta
import { AlertType } from '../../alert/alert-type.type'; // Asegura la ruta correcta
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faUser, faShieldAlt } from '@fortawesome/free-solid-svg-icons'; // Íconos

// --- Interfaces de Datos ---
interface UserRole {
  id: number;
  name: string;
  description: string;
}

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  role: UserRole;
  use2fa: boolean;
}

interface UpdatePayload {
  firstname: string;
  lastname: string;
  phoneNumber: string;
  password?: string; // Opcional para la actualización
  use2fa: boolean;
}

@Component({
  selector: 'app-ajustes',
  imports: [CommonModule, FormsModule, FontAwesomeModule, Alert],
  templateUrl: './ajustes.html',
  styleUrl: './ajustes.css'
})
export class Ajustes implements OnInit {
  // Propiedades de estado
  isLoading: boolean = true;
  isSaving: boolean = false;
  
  // Datos del perfil actual
  userProfile: UserProfile | null = null;
  
  // Modelo del formulario (Editable)
  formModel: UpdatePayload & { email: string; currentPassword?: string; confirmPassword?: string } = {
    // Inicialización de campos necesarios para el formulario
    firstname: '',
    lastname: '',
    phoneNumber: '',
    email: '',
    use2fa: false,
  };
  
  // Íconos
  faSave = faSave;
  faUser = faUser;
  faShield = faShieldAlt;
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  // Endpoints API
  private usersApiUrl = 'http://147.135.215.156:8090/api/v1/users'; // Base para PUT /:id
  private meApiUrl = 'http://147.135.215.156:8090/api/v1/users/me'; // GET /me

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private alertService: Alert,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.http.get<UserProfile>(this.meApiUrl, { headers: this.getHeaders() }).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        
        // Rellenar el modelo del formulario con los datos recibidos
        this.formModel.firstname = profile.firstname;
        this.formModel.lastname = profile.lastname;
        this.formModel.phoneNumber = profile.phoneNumber;
        this.formModel.email = profile.email; // El email no se edita, pero se muestra
        this.formModel.use2fa = profile.use2fa;
        
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        this.showAlert('danger', 'Error al cargar los datos del perfil.');
      }
    });
  }
  
  validatePasswords(): boolean {
    const password = this.formModel.currentPassword;
    const confirm = this.formModel.confirmPassword;
    
    // Si no se está intentando cambiar la contraseña (ambos campos vacíos)
    if (!password && !confirm) {
      return true; 
    }
    
    // Si solo uno de los campos de cambio de contraseña está lleno
    if ((password && !confirm) || (!password && confirm)) {
      this.showAlert('danger', 'Debes ingresar y confirmar la nueva contraseña.');
      return false;
    }
    
    // Si la contraseña nueva no coincide con la confirmación
    if (password !== confirm) {
      this.showAlert('danger', 'La nueva contraseña y la confirmación no coinciden.');
      return false;
    }
    
    return true;
  }
  
  saveProfile(): void {
    if (this.isSaving || !this.userProfile) return;
    
    if (!this.validatePasswords()) {
      return;
    }
    
    this.isSaving = true;

    // 1. Construir el payload
    const payload: UpdatePayload = {
      firstname: this.formModel.firstname,
      lastname: this.formModel.lastname,
      phoneNumber: this.formModel.phoneNumber,
      use2fa: this.formModel.use2fa,
    };
    
    // 2. Añadir la contraseña si se proporcionó y pasó la validación
    if (this.formModel.currentPassword) {
      payload.password = this.formModel.currentPassword;
    }

    const id = this.userProfile.id;

    this.http.put<any>(`${this.usersApiUrl}/${id}`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlert('success', '¡Perfil actualizado exitosamente!');
        
        // Limpiar los campos de contraseña después de un cambio exitoso
        this.formModel.currentPassword = '';
        this.formModel.confirmPassword = '';
        
        // Opcional: Recargar el perfil por si hay algún dato que se deba refrescar
        this.loadUserProfile();
        this.cdr.markForCheck();
      },
      error: (httpError: HttpErrorResponse) => {
        this.isSaving = false;
        
        const errors = this.authService.extractErrorMessages(
          httpError, 
          'Error al intentar guardar los cambios del perfil.'
        );
        
        this.showAlert('danger', errors);
      }
    });
  }
  //manejo modal:
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
