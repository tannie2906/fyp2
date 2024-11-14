// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        // Save the token in local storage
        localStorage.setItem('token', response.token);
        // Redirect to the home page on successful login
        this.router.navigate(['/home']);
      },
      (error) => {
        alert('Login failed'); // Show an error message if login fails
      }
    );
  }
}
