import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { UserFile } from '../models/user-file.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service'; 
import { environment } from 'src/environments/environment';

export interface File {
  id: number;
  user_id: number;
  filename: string; 
  file_name: string;
  size: number;
  type?: string; // Optional if not provided
  upload_date: string;
  path: string;
  created_at: string;
  is_deleted?: boolean;
  deleted_at?: string;
  file_path: string;
}

@Injectable({
  providedIn: 'root',
})

export class FileService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL for the API
  folderFiles: File[] = [];
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  // Utility: Get authorization headers
  private getHeaders() {
    return {
      headers: {
        Authorization: `Token ${this.authService.getToken()}`,
      },
    };
  }

  // Fetch all user files
  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files/`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching files:', error.message);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  // Fetch all files
  getFolderFiles(): Observable<File[]> {
    return this.http.get<File[]>(`${this.apiUrl}/files/`, this.getHeaders()).pipe(
      catchError(this.handleError('getFolderFiles', []))
    );
  }
  
  // Get URL for a specific file
  getFileUrl(fileName: string): Observable<{ fileUrl: string }> {
    return this.http.get<{ fileUrl: string }>(`${this.apiUrl}/files/${fileName}`, this.getHeaders());
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
  deleteFile(fileId: number, isDeleted: boolean = false): Observable<any> {
    const endpoint = isDeleted ? 'delete' : 'files/delete';  // 'files/delete' is the correct endpoint
    const url = `${this.apiUrl}/${endpoint}/${fileId}/`;

    return this.http.delete(url, this.getHeaders()).pipe(
        tap(() => console.log(`File ${isDeleted ? 'permanently' : 'temporarily'} deleted: ID ${fileId}`)),
        catchError(this.handleError('deleteFile'))
    );
  }

  // Fetch deleted files
  getDeletedFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/deleted-files/`, this.getHeaders()).pipe(
      catchError(this.handleError('getDeletedFiles', []))
    );
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

  // Example method to search files
  searchFiles(searchTerm: string, page: number) {
    const searchUrl = `${environment.apiUrl}/apisearch/?search=${searchTerm}&page=${page}`;

    return this.http.get(searchUrl);
  }

  // Error handling utility
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T); // Return default result on error
    };
  }
}  