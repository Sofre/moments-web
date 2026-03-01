import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth_service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login_page.html',
  styleUrls: ['./login_page.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginPageComponent {
  secret: string = '';
  loginError = false;
  loginSuccess = false;
  componentTitle = 'Login';
  showHint = false;

  constructor(private authService: AuthService, private router: Router) {}


  // direct login try automaticly on component load, for seamless login experience until local storage is cleared. Not a secure authentication method, but provides a frictionless experience for users who don't want to log in every time. Should be used in conjunction with the main password-based login for better security.
  async ngOnInit() {
    this.loginError = false; // Clear any previous error state
    await this.authService.autoLogin(); // Attempt automatic login based on device ID
    if(this.authService.isLoggedIn()) {
      this.loginSuccess = true;
        this.loginError = false;
        setTimeout(() => {
            this.router.navigate(['/home']);
        }, 1500);
    } else {
      this.loginError = false; // Clear any previous error state
      
    }
  
  }

  
  async onLogin() {
    this.loginError = false; // Clear any previous error state
    const success = await this.authService.login(this.secret);
    if (success) {
      this.loginSuccess = true;
      this.loginError = false;
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    } else {
      this.loginError = true;
      console.log('Login failed: Incorrect password');
      console.log('Hash password:', this.authService.hashPassword(this.secret));
      console.log('Login failed: Incorrect password');
      this.loginSuccess = false;
    }
  }
}