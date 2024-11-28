import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserFile } from '../models/user-file.model';


@Injectable({
  providedIn: 'root',
})

export class FileService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL for the API
  authService: any;


  constructor(private http: HttpClient) {}

  // Fetch the user's uploaded files from the backend
  getFiles(): Observable<UserFile[]> {
    return this.http.get<UserFile[]>(`${this.apiUrl}/files/`);
  }
  
  // Get the URL for a specific file
  getFileUrl(fileName: string): Observable<{ fileUrl: string }> {
    return this.http.get<{ fileUrl: string }>(`${this.apiUrl}/files/${fileName}`); // Corrected `apiUrl`
  }  
}
