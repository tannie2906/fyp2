import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { UserFile } from '../models/user-file.model';


@Injectable({
  providedIn: 'root',
})

export class FileService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL for the API
  authService: any;
  router: any;
  
  constructor(private http: HttpClient) {}

  // Fetch all user files
  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files/`);
  }

  // Fetch deleted files
  getDeletedFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files/deleted/`);
  }

  // Delete a file
  deleteFile(fileId: number): Observable<any> {
    const url = `/api/files/${fileId}/`;  // Ensure this matches backend route
    return this.http.delete(url);
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
    return this.http.get<{ fileUrl: string }>(`${this.apiUrl}/files/${fileName}`); // Corrected `apiUrl`
  }  

  // Rename file
  renameFile(fileId: number, newName: string): Observable<any> {
    const url = `${this.apiUrl}/files/${fileId}/rename`; // Correct base URL
    return this.http.put(url, { newName }); // Ensure payload is correct
}

  goToBin(): void {
    this.router.navigate(['/delete']); // Navigate to the delete page
  }
}
