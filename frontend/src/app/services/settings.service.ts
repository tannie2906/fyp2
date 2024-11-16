// settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Ensures this service can be injected globally
})
export class SettingsService {
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  constructor(private http: HttpClient) {}

  // Update Username
  updateUsername(username: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-username`, { username });
  }

  // Update Password
  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-password`, {
      currentPassword,
      newPassword,
    });
  }
}
