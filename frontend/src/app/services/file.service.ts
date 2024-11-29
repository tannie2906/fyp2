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

  // Fetch the user's uploaded files from the backend
  getFiles(): Observable<UserFile[]> {
    return this.http.get<UserFile[]>(`${this.apiUrl}/files/`);
  }
  
  // Get the URL for a specific file
  getFileUrl(fileName: string): Observable<{ fileUrl: string }> {
    return this.http.get<{ fileUrl: string }>(`${this.apiUrl}/files/${fileName}`); // Corrected `apiUrl`
  }  

  // Rename file
  renameFile(fileId: number, newName: string): Observable<any> {
    const url = `http://localhost:8000/api/files/${fileId}/rename`;
    const body = { newName: newName };
  
    return this.http.put(url, body).pipe(
      catchError((error) => {
        console.error('File rename failed:', error);
        return of(error);
      })
    );
  }

  goToBin(): void {
    this.router.navigate(['/delete']); // Navigate to the delete page
  }
}
