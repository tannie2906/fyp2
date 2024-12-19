import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeletedFilesService {
  private baseUrl = 'http://localhost:8000/api';
  private apiUrl = '/api/files/deleted'; 
  private deletedFilesKey = 'deletedFiles'; // Key to store files in localStorage
  headers: HttpHeaders | { [header: string]: string | string[]; } | undefined;
  fileService: any;

  constructor(private http: HttpClient) {}

  // Add a deleted file to the service and localStorage
  addDeletedFile(file: { id: number; name: string }): Observable<void> {
    console.log('Notifying server about deleted file:', file);
    return this.http.post<void>(this.apiUrl, file); // Notify backend with file details
  }

  deleteFile(fileId: number) {
    return this.fileService.deleteFile(fileId);
  }


  // Get deleted files from both localStorage and the server
  getDeletedFiles(): Observable<any[]> {
    const url = `${this.apiUrl}/deleted/`; // Ensure this matches Django's route
    return this.http.get<any[]>(url);
}

  // Synchronous version for internal use
  //private getDeletedFilesSync(): any[] {
    //const deletedFiles = localStorage.getItem(this.deletedFilesKey);
    //return deletedFiles ? JSON.parse(deletedFiles) : [];
  //}

  // Restore a deleted file and remove from the deleted list
  restoreDeletedFile(fileId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/restore/${fileId}`, {});
  }

  // Clear all deleted files from localStorage (empty the bin)
  clearDeletedFiles(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => {
        // Clear local storage or any cache
        localStorage.removeItem('deletedFiles');
      })
    );
  }

  // Permanently delete a file
  permanentlyDeleteFile(fileId: number) {
    return this.fileService.permanentlyDeleteFile(fileId);
  }
}