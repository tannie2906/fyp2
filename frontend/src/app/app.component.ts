import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  
import { AuthService } from './auth.service';
import { ApiService } from './services/api.service';
import { HttpClient } from '@angular/common/http';
import { UserFile } from './models/user-file.model';

export interface File {
  id: number;
  user_id: number;
  filename: string; 
  file_name: string;
  size: number;
  type?: string; // Optional if not provided
  upload_date: string;
  path: string;
  created_at: string;
  is_deleted?: boolean;
  deleted_at?: string;
  file_path: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  isAuthenticated: boolean = false;
  title = 'frontend';
  profilePictureUrl: string = '';
  dropdownVisible: boolean = false;
  searchResults: File[] = [];
  query: string = '';
  totalPages: number = 0;
  currentPage: number = 1;

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService,
    private http: HttpClient
  ) {}


  goToLogin() {
    this.router.navigate(['/login']);  // Navigate to the login page
  }

  onLogin(): void {
    // Navigate to login page or trigger login functionality
    this.router.navigate(['/login']);
  }

  onLogout(): void {
    // Clear authentication token and update authentication status
    localStorage.removeItem('auth_token');
    this.isAuthenticated = false;  // Immediately update isAuthenticated to false
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    // Always check the authentication status when the component is initialized
    this.checkAuthenticationStatus();

    // Fetch user profile data (e.g., picture) if authenticated
    if (this.isAuthenticated) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.authService.getProfile(token).subscribe({
          next: (data) => {
            this.profilePictureUrl = data.picture || 'assets/images/profile.png'; // Default if no picture
          },
          error: (err) => {
            console.error('Error fetching profile:', err);
          }
        });
      }
    }
  }

  checkAuthenticationStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  onProfileClick(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/profile']);  // Navigate to profile page if authenticated
    } else {
      this.router.navigate(['/login']);    // Navigate to login page if not authenticated
    }
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  //search bar
  search(): void {
    if (this.query.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.query, page: 1 } });
    }
  }  
}  
