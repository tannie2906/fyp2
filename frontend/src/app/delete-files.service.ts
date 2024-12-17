import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeletedFilesService {
  private apiUrl = '/api/files/deleted'; 
  private deletedFilesKey = 'deletedFiles'; // Key to store files in localStorage

  constructor(private http: HttpClient) {}

  // Add a deleted file to the service and localStorage
  addDeletedFile(file: any): Observable<void> {
    const deletedFiles = this.getDeletedFilesSync(); // Get existing deleted files
    if (!deletedFiles.some(f => f.id === file.id)) {
      deletedFiles.push(file); // Add the new file only if it doesn't exist already
      localStorage.setItem(this.deletedFilesKey, JSON.stringify(deletedFiles)); // Persist in localStorage
    }
    return of(); // Return an observable
  }

  // Get deleted files from localStorage (returns an Observable)
  getDeletedFiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }  

  // Synchronous version for internal use
  private getDeletedFilesSync(): any[] {
    const deletedFiles = localStorage.getItem(this.deletedFilesKey);
    return deletedFiles ? JSON.parse(deletedFiles) : [];
  }

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
}