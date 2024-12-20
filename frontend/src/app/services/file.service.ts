import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { UserFile } from '../models/user-file.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service'; 

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
  folderFiles: File[] = [];
  
  constructor(private http: HttpClient, private authService: AuthService) {}

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

  // delete method
  deleteFile(fileId: string, fileName: string): Observable<any> {
    const url = `http://127.0.0.1:8000/api/delete/${fileId}/`;
    return this.http.delete(url, {
      headers: {
        Authorization: `Token ${this.authService.getToken()}`,
      },
      body: { name: fileName }, // Send the name of the file in the body
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        return of(error.error);
      })
    );
  }
  

  // fetch delete file, for delete page
  getDeletedFiles(): Observable<any> {
    return this.http.get('/api/deleted-files'); // Replace with the actual backend API URL
  }

}  