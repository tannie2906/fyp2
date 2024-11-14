import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL for the API

  constructor(private http: HttpClient) {}

  // Fetch user files from the backend
  getUserFiles(): Observable<Array<{ name: string; size: number }>> {
    return this.http.get<Array<{ name: string; size: number }>>(`${this.apiUrl}/files`);
  }

  // Upload a file to the backend
  uploadFile(file: File, fileName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);

    // Adjusting API endpoint to the base URL
    return this.http.post(`${this.apiUrl}/upload`, formData); 
  }
}
