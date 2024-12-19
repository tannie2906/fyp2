import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { UserFile } from '../models/user-file.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '/Users/intan/testproject/frontend/src/app/auth.service'

export interface File {
  id: number;
  filename: string; 
  size: number;
  type?: string; // Optional if not provided
  upload_date: string;
  path: string;
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
    return this.http.get<any[]>(`${this.apiUrl}/files/`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching files:', error.message);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  // Correctly typed method to fetch files
  getFolderFiles(): Observable<File[]> {
    return this.http.get<File[]>(`${this.apiUrl}/files/`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching folder files:', error.message);
        return of([]); // Return an empty array on error
      })
    );
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

  // Fetch starred files
  getStarredFiles(): Observable<any[]> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found!');
      return of([]); // Return an empty array if no token exists
    }

    return this.http.get<any[]>(`${this.apiUrl}/files/starred/`, {
      headers: { Authorization: `Bearer ${token}` },
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching starred files:', error.message);
        return of([]); // Return empty array in case of error
      })
    );
  }
  
  // Toggle star status of a file
  toggleStar(fileId: number, isStarred: boolean): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found!');
      return of({ error: 'No token found!' }); // Handle error gracefully
    }

    return this.http.post(
      `${this.apiUrl}/files/toggle-star/${fileId}/`,
      { isStarred },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error toggling star status:', error.message);
        return of({ error: error.error?.error || 'Failed to toggle star' });
      })
    );
  }

  // Delete file
  deleteFile(id: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found!');
      return of({ error: 'No token found!' }); // Handle error gracefully
    }

    return this.http.delete(`${this.apiUrl}/delete/${id}/`, {
      headers: { Authorization: `Token ${token}` },
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error deleting file:', error.message);
        return of({ error: 'Failed to delete file' });
      })
    );
  }

  // fetch delete file, for delete page
  getDeletedFiles(): Observable<any> {
    return this.http.get('/api/deleted-files'); // Replace with the actual backend API URL
  }
}  