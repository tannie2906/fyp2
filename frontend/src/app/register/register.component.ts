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
      password: this.password,
      email: this.email
    };

   // Call the AuthService's register method
   this.authService.register(userData).subscribe({
    next: (response: any) => {
      console.log('Response from server:', response);
      alert('User registered successfully');

      // Store the token if it is provided by the backend
      if (response.token) {
        localStorage.setItem('auth_token', response.token);  // Save token for future requests
      }

      // Redirect to the main page after successful registration
      this.router.navigate(['/home']);  //go to home page after success
    },
    error: (error: HttpErrorResponse) => {
      console.error('Error registering user:', error);
      alert('Error registering user: ' + (error.error?.message || 'Unknown error'));
    }
  });
}
}