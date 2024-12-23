import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserFile } from '../models/user-file.model';


@Injectable({
  providedIn: 'root',
})

export class FileService {
  private filesSubject = new BehaviorSubject<UserFile[]>([]);
  private files: UserFile[] = [];
  private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL for the API


  constructor(private http: HttpClient) {}

  // Fetch the user's uploaded files from the backend
  getFiles(): Observable<UserFile[]> {
    return this.http.get<UserFile[]>(`${this.apiUrl}/files`); // Corrected `apiUrl`
  }

  fetchFiles(): void {
    this.http.get<UserFile[]>(`${this.apiUrl}/files`).subscribe(
      (files) => {
        this.filesSubject.next(files); // Emit the array
      },
      (error) => {
        console.error('Error fetching files:', error);
      }
    );
  }

  addFile(newFile: UserFile): void {
    this.files.push(newFile);
    this.filesSubject.next(this.files); // Notify subscribers
  }
  

  setFiles(files: UserFile[]): void {
    this.files = files;
    this.filesSubject.next(this.files);
  }

  // Get the URL for a specific file
  getFileUrl(fileName: string): Observable<{ fileUrl: string }> {
    return this.http.get<{ fileUrl: string }>(`${this.apiUrl}/files/${fileName}`); // Corrected `apiUrl`
  }  
}
