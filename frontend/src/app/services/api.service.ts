import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // Function to send DELETE request with CSRF token
  deleteItem(id: number) {
    const csrfToken = this.getCookie('csrftoken'); // Fetch CSRF token from cookies
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken,
    });

    return this.http.delete(`http://127.0.0.1:8000/api/permanently-delete/${id}/`, { headers });
  }

  // Helper function to retrieve CSRF token from cookies
  private getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }
}