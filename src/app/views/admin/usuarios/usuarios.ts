import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Alert } from '../../../components/shared/alert/alert';
import { AlertType } from '../../../components/shared/alert/alert-type.type';
interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  use2fa: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
}
interface ApiResponse {
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, Alert],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
   users: User[] = [];
  filteredUsers: User[] = [];
  roles: Role[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  isEditMode = false;
  selectedUser: User | null = null;
  faPlus = faPlus;
  faEdit = faEdit;
  faTrash = faTrash;
  faEye = faEye;
  faSearch = faSearch;

  userForm: FormGroup;
  isAlertModalOpen: boolean = false;
  alertType: AlertType = 'info';
  alertMessage: string | string[] = '';
  private apiUrl = 'http://147.135.215.156:8090/api/v1/users?page=0&size=1000&sortBy=id&ascending=true';
  private createurl = 'http://147.135.215.156:8090/api/v1/users';
  private rolesUrl = 'http://147.135.215.156:8090/api/v1/roles';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      firstname: [''],
      lastname: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: [''], // Hacer el campo de contraseña opcional para la edición
      role: ['', [Validators.required]],
      use2fa: [true], // Agregar el nuevo campo con un valor inicial de 'false'
      isactive: [true]
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log(token);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadUsers() {
    const headers = this.getHeaders();
    // Change the type to ApiResponse
    this.http.get<ApiResponse>(this.apiUrl, { headers }).subscribe({
      next: (response) => {
        // Access the 'content' property from the response object
        this.users = response.content;
        this.filteredUsers = response.content;
        console.log('Users loaded successfully:', this.users);
        this.cdr.markForCheck(); 
      },
      error: (error) => {

      }
    });
  }

  loadRoles() {
    const headers = this.getHeaders();
    this.http.get<Role[]>(this.rolesUrl, { headers }).subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
      }
    });
  }

  searchUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.firstname.toLowerCase().includes(term) ||
      user.lastname.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phoneNumber.includes(term)
    );
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm.reset();
    this.userForm.get('lastname')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.userForm.get('firstname')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.userForm.get('role')?.setValidators([Validators.required]);
    this.userForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.updateValueAndValidity();
    this.isModalOpen = true;
  }

openEditModal(user: User) {
  this.isEditMode = true;
  this.selectedUser = user;
  this.userForm.patchValue({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    phoneNumber: user.phoneNumber,
    // Fix this line
    roleId: user.role.id, // <-- Change user.role to user.role.id
    use2fa: user.use2fa,
    password: '', // No mostramos la contraseña actual
    isactive: user.active
  });
    this.userForm.get('role')?.clearValidators();
    this.userForm.get('role')?.updateValueAndValidity();
    this.userForm.get('email')?.clearValidators();
    this.userForm.get('email')?.updateValueAndValidity();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  this.isModalOpen = true;
  
}

  closeModal() {
    this.isModalOpen = false;
    this.userForm.reset();
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      const headers = this.getHeaders();
      
      if (this.isEditMode && this.selectedUser) {
        // Editar usuario existente
         const editPayload: any = {
            firstname: formData.firstname,
            lastname: formData.lastname,
            phoneNumber: formData.phoneNumber,
            // Add use2fa with a default or user-defined value
            use2fa: formData.use2fa, // Assuming a default value, or adapt as needed
            isActive: formData.isactive,
        };
        if (formData.password && formData.password.length > 0) {
          editPayload.password = formData.password;
        }

          this.http.put(`${this.createurl}/${this.selectedUser.id}`, editPayload, { headers })
            .subscribe({
              next: () => {
                this.showAlert('success', 'El usuario se modifico correctamente');
                this.loadUsers();
                this.closeModal();
              },
              error: (httpError) => {
                let errors: string[] = ['Ocurrió un error desconocido al crear el empleado.'];
            
            if (httpError.error && httpError.error.errors && Array.isArray(httpError.error.errors)) {
                errors = httpError.error.errors.map((err: any) => err.message || err);
            } else if (httpError.error && httpError.error.message) {
                errors = [httpError.error.message];
            } else if (httpError.message) {
                errors = [httpError.message];
            }
              }
            });
      } else {
        // Crear nuevo usuario
        const createPayload = {
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            use2fa: formData.use2fa,
            roleId: Number(formData.role) 
        };
        this.http.post(this.createurl, createPayload, { headers })
          .subscribe({
            next: () => {
              this.showAlert('success', 'El usuario se creó correctamente');
              this.loadUsers();
              this.closeModal();
            },
            error: (httpError) => {
              let errors: string[] = ['Ocurrió un error desconocido al crear el empleado.'];
            
            if (httpError.error && httpError.error.errors && Array.isArray(httpError.error.errors)) {
                errors = httpError.error.errors.map((err: any) => err.message || err);
            } else if (httpError.error && httpError.error.message) {
                errors = [httpError.error.message];
            } else if (httpError.message) {
                errors = [httpError.message];
            }
            }
          });
      }
    }
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
  deleteUser(user: User) {
    if (confirm(`¿Estás seguro de que quieres inhabilitar a ${user.firstname} ${user.lastname}?`)) {
      const headers = this.getHeaders();
      this.http.delete(`${this.createurl}/${user.id}`, { headers })
        .subscribe({
          next: () => {
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
          }
        });
    }
  }

  toggleUserStatus(user: User) {
    const headers = this.getHeaders();
    const newStatus = !user.active;
    
    this.http.patch(`${this.apiUrl}/${user.id}/status`, { active: newStatus }, { headers })
      .subscribe({
        next: () => {
          user.active = newStatus;
        },
        error: (error) => {
          console.error('Error updating user status:', error);
        }
      });
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Sin rol';
  }
}