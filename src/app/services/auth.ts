import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.loadStoredUser();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(credentials: any): Observable<any> {
    return this.http.post('http://147.135.215.156:8090/api/v1/auth/login', credentials, { observe: 'response' });
  }

  storeUserData(token: string, userData: any): void {
    if (this.isBrowser()) {
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_id', userData.user.id.toString());
      localStorage.setItem('role_id', userData.user.role.id.toString());
      localStorage.setItem('user_data', JSON.stringify(userData.user));
    }
    this.currentUserSubject.next(userData.user);
  }

  storeUserDatafa(token: string, userData: any): void {
    if (this.isBrowser()) {
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_id', userData.id.toString());
      localStorage.setItem('role_id', userData.role.id.toString());
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
    this.currentUserSubject.next(userData);
  }

  getUserId(): number | null {
    if (this.isBrowser()) {
      const userId = localStorage.getItem('user_id');
      return userId ? parseInt(userId, 10) : null;
    }
    return null;
  }

  getRoleId(): number | null {
    if (this.isBrowser()) {
      const roleId = localStorage.getItem('role_id');
      return roleId ? parseInt(roleId, 10) : null;
    }
    return null;
  }

  getUserData(): any {
    if (this.isBrowser()) {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  private loadStoredUser(): void {
    if (this.isBrowser()) {
      const userData = this.getUserData();
      if (userData) {
        this.currentUserSubject.next(userData);
      }
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('role_id');
      localStorage.removeItem('user_data');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }
  isLoggedIn(): boolean {
    return this.getToken() !== null && this.getUserData() !== null;
  }

  // Método para verificar si el token es válido (opcional)
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Aquí puedes añadir lógica para verificar expiración del token
    // si tu JWT incluye timestamp de expiración
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        this.logout(); // Token expirado, hacer logout automático
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

   /**
   * Extrae y formatea los mensajes de error de una respuesta HTTP del backend.
   * Centraliza la lógica de parseo de los diferentes formatos de error.
   * * @param httpError El objeto HttpErrorResponse recibido en el catchError/error.
   * @param defaultMessage Mensaje por defecto si no se encuentra un error específico.
   * @returns Un array de strings con los mensajes de error.
   */
  public extractErrorMessages(httpError: HttpErrorResponse, defaultMessage: string = 'Ocurrió un error desconocido.'): string[] {
    
    // Si no hay objeto de error (ej. error de red), usamos el mensaje genérico.
    if (!httpError || !httpError.error) {
        return [defaultMessage];
    }
    
    let errors: string[] = [];
    const errorBody = httpError.error;

    if (Array.isArray(errorBody)) {
        // CASO 1: Formato del backend: [{"type": "...", "message": "..."}]
        errors = errorBody
            .map((err: any) => err.message)
            .filter((msg: string) => msg && msg.length > 0);
    
    } else if (errorBody.errors && Array.isArray(errorBody.errors)) {
        // CASO 2: Formato estándar: { errors: [{message: '...'}, ...] }
        errors = errorBody.errors
            .map((err: any) => err.message || err)
            .filter((msg: string) => msg && msg.length > 0);
    
    } else if (errorBody.message) {
        // CASO 3: Mensaje principal: { message: 'Mensaje de error.' }
        errors = [errorBody.message];
    
    } else if (typeof errorBody === 'string' && errorBody.length > 0) {
        // CASO 4: El cuerpo del error es un string plano
        errors = [errorBody];
    }

    // Si no se encontró ningún mensaje válido, usamos el mensaje por defecto o el mensaje HTTP.
    if (errors.length === 0) {
        return [httpError.message || defaultMessage];
    }

    return errors;
  }
}