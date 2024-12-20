import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Your API URL

  constructor(private http: HttpClient) {}

  getDeletedFiles(userId: string, headers: HttpHeaders): Observable<any[]> {
    const url = `http://127.0.0.1:8000/api/deleted-files/`; // No additional filters here
    return this.http.get<any[]>(url, { headers });
  }  

  // Restore a file by ID
  restoreFile(fileId: number, headers: HttpHeaders): Observable<any> {
    const url = `http://127.0.0.1:8000/api/restore-file/${fileId}/`; // Ensure URL matches the backend
    return this.http.post(url, {}, { headers }); // Pass headers for CSRF or authentication
}

  // Permanently delete a file by ID
  permanentlyDeleteFile(fileId: number, headers?: HttpHeaders): Observable<any> {
    return this.http.delete(`${this.apiUrl}/permanently-delete/${fileId}/`, { headers });
  }

  // Empty trash
  emptyTrash(headers?: HttpHeaders): Observable<any> {
    return this.http.delete(`${this.apiUrl}/empty-trash/`, { headers });
  }
}