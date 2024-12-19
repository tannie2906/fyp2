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
    return this.http.get<any[]>(`${this.apiUrl}/deleted-files`, {
      params: { userId: userId }, 
      headers: headers,
    });
  }
  // Restore a file by ID
  restoreFile(fileId: number, headers?: HttpHeaders): Observable<any> {
    return this.http.post(`${this.apiUrl}/restore-file/${fileId}/`, {}, { headers });
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