import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

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
}