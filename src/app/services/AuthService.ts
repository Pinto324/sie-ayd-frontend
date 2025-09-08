import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api.tudominio.com/auth';

  constructor(private http: HttpClient) {}

  login(credentials: LoginData): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  logout(): void {
    // Lógica de logout
  }

  isLoggedIn(): boolean {
    // Verificar si está autenticado
    return false;
  }
}