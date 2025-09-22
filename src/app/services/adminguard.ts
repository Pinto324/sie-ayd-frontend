import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const roleId = this.authService.getRoleId();
    
    if (this.authService.isLoggedIn() && this.authService.isTokenValid() && roleId === 1) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}