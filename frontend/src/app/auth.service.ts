import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';  // Add this import

import axios from 'axios';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; //make sure this api url correct
  private isLoggedIn = false; // set to true if user is logged in
  private registerUrl = 'http://127.0.0.1:8000/api/register/';
  private tokenKey = 'auth_token';
  private profileSubject = new BehaviorSubject<any>(null);
  public profile$ = this.profileSubject.asObservable();
  

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    // Send a login request to the backend
    return this.http.post<any>(`${this.apiUrl}/login/`, { username, password }).pipe(
      tap((response: any) => {  // Log the response to see the result
        if (response && response.token) {
          this.isLoggedIn = true;
          localStorage.setItem('auth_token', response.token); // Store token
        }
      })
    );
  }

  // Check if user is authenticated (is logged in)
  isAuthenticated(): boolean {
    return this.isLoggedIn || localStorage.getItem('auth_token') !== null; // Check if there's a token stored in localStorage
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token'); // Retrieve the token
  }

  logout(): void {
    localStorage.removeItem('auth_token'); // Clear the token on logout
    this.isLoggedIn = false;
  }

// Fetch user profile
  getProfile(token: string): Observable<any> {
    return this.http.get('/api/profile', { headers: { Authorization: `Token ${token}` } })
      .pipe(
        tap((profile) => {
          this.profileSubject.next(profile); // Update the shared state
        })
      );
  }

  // Expose a method to update the profile state directly
  updateProfileState(updatedProfile: any): void {
    this.profileSubject.next(updatedProfile);
  }


  updateProfile(token: string, data: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    return this.http.put<any>(`${this.apiUrl}/profile/`, data, { headers });
  }

  getSettings(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    return this.http.get<any>(`${this.apiUrl}/settings/`, { headers });
  }

  updateSettings(token: string, data: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    return this.http.put<any>(`${this.apiUrl}/settings/`, data, { headers });
  }
  
  register(userData: any) {
    return this.http.post(this.registerUrl, userData);
  }
  
}

