import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  email: string = ''; // Include other fields if needed

  constructor(private authService: AuthService) {}

  // Call register method from AuthService
  register() {
    if (!this.username || !this.password || !this.email) {
      alert('All fields are required.');
      return;
    }

    const userData = {
      username: this.username,
      password: this.password,
      email: this.email
    };

    // Make the registration request
    this.authService.register(userData).subscribe({
      next: (response: any) => {
        console.log('Response from server:', response);
        alert('User registered successfully');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error registering user:', error);
        alert('Error registering user: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
}