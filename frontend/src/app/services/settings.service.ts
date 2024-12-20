// settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '/Users/intan/testproject/frontend/src/app/auth.service';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root', // Ensures this service can be injected globally
})
export class SettingsService {
  private apiUrl = 'http://127.0.0.1:8000/api'; 
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  updateUsername(newUsername: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-username`, { username: newUsername }).pipe(
      tap(() => {
        // Fetch the updated profile and update the shared state
        const token = localStorage.getItem('auth_token');
        if (token) {
          this.authService.getProfile(token).subscribe();
        }
      })
    );
  }

  updateNameDetails(firstName: string, lastName: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-name`, { first_name: firstName, last_name: lastName }).pipe(
      tap(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          this.authService.getProfile(token).subscribe();
        }
      })
    );
  }


  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-password`, {
      currentPassword,
      newPassword,
    });
  }

  getSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/settings/`);
  }

  updateProfile(profileData: any): Observable<any> {
    console.log('Payload sent to backend:', profileData); // Log payload
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    });
    return this.http.put(`${this.baseUrl}/update-profile`, profileData, { headers });
  }
   

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    console.log('Uploading file:', file); // Log file details
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    });
    return this.http.post(`${this.baseUrl}/upload-profile-picture/`, formData, { headers });
  }  
}