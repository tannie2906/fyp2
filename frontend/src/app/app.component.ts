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
  onSearch(query: string): void {
    const encodedQuery = encodeURIComponent(query); // Encode query parameter
    this.http.get<any>(`/api/apisearch/?search=${encodedQuery}`).subscribe(
      (response: any) => { // Change 'File[]' to 'any'
        console.log(response);
        this.searchResults = response;
      },
      (error: any) => {
        console.error('Search API error:', error);
      }
    );
  }

  onSearchClick(): void {
    if (this.query.trim()) {
      this.getSearchResults(this.query, 1); // Start with page 1
    }
  }
  // Get results for specific page
  getSearchResults(query: string, page: number): void {
    this.apiService.getSearchResults(query, page).subscribe(
      (response: any) => {
        this.searchResults = response.results; // Results for the current page
        this.totalPages = Math.ceil(response.count / 10); // Total pages
        this.currentPage = page; // Track the current page
      },
      (error: any) => {
        console.error('Search API error:', error);
      }
    );
  }

  // Go to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.getSearchResults(this.query, this.currentPage + 1);
    }
  }

  // Go to the previous page
  prevPage(): void {
    if (this.currentPage > 1) {
      this.getSearchResults(this.query, this.currentPage - 1);
    }
  }
}
