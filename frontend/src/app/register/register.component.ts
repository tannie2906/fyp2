import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  firstName: string = '';
  lastName: string = '';
  password: string = '';
  email: string = ''; // Include other fields if needed

  constructor(private authService: AuthService, 
    private http: HttpClient, 
    private router: Router
  ) {}

  // Call register method from AuthService
  register() {
    if (!this.username || !this.password || !this.email) {
      alert('All fields are required.');
      return;
    }
  
    const userData = {
      username: this.username,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.password
    };
  
    console.log('User registration data:', userData); // Debugging payload
  
    this.authService.register(userData).subscribe({
      next: (response: any) => {
        console.log('Response from server:', response);
        alert('User registered successfully');
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }
        this.router.navigate(['/home']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error registering user:', error);
        alert('Error registering user: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
  
}