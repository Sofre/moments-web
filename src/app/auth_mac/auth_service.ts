import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';



@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = false;
 
  isLoggedIn(): boolean {
    return this.loggedIn;
    // Call deviceId to ensure it runs on app load, providing seamless login until local storage is cleared. Not a secure authentication method, but provides a frictionless experience for users who don't want to log in every time. Should be used in conjunction with the main password-based login for better security.

  }
  // Will access .env file for the password in the future, for now just a placeholder
  async login(pass: string): Promise<boolean> {
    const saltedPass = environment.auth.salt + pass;
    const hashedPass = await this.hashPassword(saltedPass);
    const env_passHash = environment.auth.hash;
    if (hashedPass === env_passHash) {
      this.loggedIn = true;
      this.deviceId(); // generate also show the device ID in the console for testing purposes
      return true;
    }
 
    return false;
  }
  // Hash the password using SHA-256
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Device ID Methods - Used for seamless login without user interaction until local storage is cleared. Not a secure authentication method, but provides a frictionless experience for users who don't want to log in every time. Should be used in conjunction with the main password-based login for better security.
  // This will be later utilized 

  // Generate a unique device ID and store it in localStorage
  generateDeviceId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get the device ID, generating and storing it if it doesn't exist - Seamless logging until the local storage is cleared
  deviceId(): string {
    const storedId = localStorage.getItem('deviceId');

    if (storedId) {
      return storedId;
    } else {
      const newId = this.generateDeviceId();
      localStorage.setItem('deviceId', newId);
      
      return newId;
    } 
  }

  async autoLogin(): Promise<boolean> {
    const storedId = localStorage.getItem('deviceId');
   
    if (storedId) {
      this.loggedIn = true; 
      return true;
    }
    
   
    return false;
    
  }


  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem('deviceId');
   
  }
}


