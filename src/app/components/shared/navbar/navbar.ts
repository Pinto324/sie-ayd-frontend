import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserRole } from '../../../services/AuthService';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
 isLoggedIn = false;
  userRole: UserRole  | null = null;
  userEmail: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userRole = user?.role || null;
      this.userEmail = user?.email || null;
    });
  }

  logout() {
    this.authService.logout();
  }

  // Helper methods para simplificar el template
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isUser(): boolean {
    return this.userRole === 'user';
  }

  isModerator(): boolean {
    return this.userRole === 'moderator';
  }
}
