import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth'; // Ajusta la ruta
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  isLoggedIn = false;
  userRole: number | null = null;
  private authSubscription!: Subscription;
  isLoggingOut = false;
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Suscribirse a los cambios del estado de autenticación
    this.authSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.isLoggedIn = !!user;
        this.userRole = user ? this.authService.getRoleId() : null;
      }

    );

    // Verificar estado inicial
    this.isLoggedIn = this.authService.getUserData() !== null;
  }

  onLogout() {
    this.isLoggingOut = true;
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.isLoggingOut = false;
    }, 500);
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
