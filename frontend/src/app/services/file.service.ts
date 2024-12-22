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
  renameFile(fileId: number, newName: string) {
    const url = `http://127.0.0.1:8000/api/rename/`;  // This is your backend URL
    const body = { file_id: fileId, new_name: newName };
  
    return this.http.post(url, body);
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
  deleteFile(fileId: string): Observable<any> {
    const url = `${this.apiUrl}/deleted-files/`; // POST instead of DELETE
    return this.http.post(url, { file_id: fileId }, {  // Send file_id in the body
      headers: {
        Authorization: `Token ${this.authService.getToken()}`,
      },
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        return of(error.error);
      })
    );
  }  
  
  getDeletedFiles(): Observable<any> {
    const url = `${this.apiUrl}/deleted-files/`; // Matches backend
    return this.http.get(url, {
      headers: {
        Authorization: `Token ${this.authService.getToken()}`,
      },
    });
  }
  

  // File download URL
  getFileDownloadUrl(fileId: number): string {
    return `${this.apiUrl}/files/download/${fileId}/`;
  }
  
  // Ensure download uses the correct filename
  downloadFile(fileId: number, token: string) {
    const url = this.getFileDownloadUrl(fileId);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    return this.http.get(url, {
      headers: headers,
      responseType: 'blob',
    });
  }
}  