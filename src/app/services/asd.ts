import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type UserRole = 'admin' | 'moderator' | 'user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: any): void {
    // Lógica de login... luego:
    const user: User = {
      id: '1',
      email: credentials.email,
      role: this.determineRole(credentials.email), // Lógica para determinar rol
      name: 'Usuario Ejemplo'
    };
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  private determineRole(email: string): UserRole {
    // Lógica para determinar el rol (puede ser desde API)
    if (email.includes('admin')) return 'admin';
    if (email.includes('mod')) return 'moderator';
    return 'user';
  }
}