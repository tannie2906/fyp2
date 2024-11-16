import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL for the API

  constructor(private http: HttpClient) {}

  // Fetch the user's uploaded files from the backend
  getUserFiles(): Observable<{ fileName: string }[]> {
    return this.http.get<{ fileName: string }[]>(`${this.apiUrl}/files/`);
  }

  // New method to get the URL of a specific file
  getFileUrl(fileName: string): Observable<{ fileUrl: string }> {
    return this.http.get<{ fileUrl: string }>(`${this.apiUrl}/files/${fileName}`);
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
