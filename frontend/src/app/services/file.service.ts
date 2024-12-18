import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { UserFile } from '../models/user-file.model';
import { HttpErrorResponse } from '@angular/common/http';

export interface File {
  id: number;
  name: string;
  size: number;
  type: string;
  // Add other fields as per your API response
}

@Injectable({
  providedIn: 'root',
})

export class FileService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL for the API
  authService: any;
  router: any;
  folderFiles: File[] = [];
  
  constructor(private http: HttpClient) {}

  // Fetch all user files
  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files/`);
  }

  // Fetch deleted files
  getDeletedFiles(): Observable<File[]> {
    return this.http.get<File[]>(`${this.apiUrl}/files/deleted/`);  // Ensure you're hitting the correct endpoint for deleted files
  }  

  // Delete a file
  deleteFile(fileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/files/${fileId}/`); // Correct backend endpoint for file deletion
  }
    

  // Correctly typed method to fetch files
  getFolderFiles(): Observable<File[]> {
    return this.http.get<File[]>(`${this.apiUrl}/files/`);  // Ensure backend is filtering out deleted files
  }
  

  // Restore a deleted file
  restoreFile(fileId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/files/${fileId}/restore/`, {});
  }

  // Empty the deleted files bin
  emptyBin(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/files/deleted/empty/`);
  }
  
  // Get the URL for a specific file
  getFileUrl(fileName: string): Observable<{ fileUrl: string }> {
    return this.http.get<{ fileUrl: string }>(`${this.apiUrl}/files/${fileName}`); // Corrected apiUrl
  }  

  // Rename file
  renameFile(fileId: number, newName: string): Observable<any> {
    const url = `${this.apiUrl}/files/${fileId}/rename/`;
    return this.http.put<any>(url, { newName }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Rename File Error:', error.message);
        return of({ error: error.error?.error || 'Failed to rename file' });
      })
    );
  }  
       

  goToBin(): void {
    this.router.navigate(['/delete']); // Navigate to the delete page
  }

  getStarredFiles() {
    return this.http.get<any[]>('http://127.0.0.1:8000/api/files/starred/', {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` },
    });
  }
  
  toggleStar(fileId: number, isStarred: boolean) {
    return this.http.post(
      `http://127.0.0.1:8000/api/files/toggle-star/${fileId}/`,
      { isStarred },
      {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` },
      }
    );
  }  
}