import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Your API URL

  constructor(private http: HttpClient, private authService: AuthService) {}

  //getDeletedFiles(userId: string, headers: HttpHeaders): Observable<any[]> {
    //const url = `http://127.0.0.1:8000/api/deleted-files/`; // No additional filters here
    //return this.http.get<any[]>(url, { headers });
  //}  
  getDeletedFiles(userId: string, headers: HttpHeaders): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deleted-files/`, { headers });
  }
  
  deleteFile(fileId: string): Observable<any> {
    const url = `${this.apiUrl}/deleted-files/`; // POST instead of DELETE
    return this.http.post(
      url,
      { file_id: fileId },
      {
        headers: {
          Authorization: `Token ${this.authService.getToken()}`,
        },
      }
    );
  }

  // Restore a file by ID
  restoreFiles(fileIds: number[], headers?: HttpHeaders): Observable<any> {
    const url = `${this.apiUrl}/restore-files/`; // Consistent endpoint URL
    console.log('Restore API URL:', url); // Log URL for debugging
    console.log('Headers:', headers); // Debugging headers
    return this.http.post(url, { file_ids: fileIds }, { headers });
}

  
  // Permanently delete a file by ID
  permanentlyDeleteFile(fileId: number, headers?: HttpHeaders): Observable<any> {
    return this.http.delete(`${this.apiUrl}/permanently-delete/${fileId}/`, { headers });
  }

  // Empty trash
  emptyTrash(headers?: HttpHeaders): Observable<any> {
    return this.http.delete(`${this.apiUrl}/empty-trash/`, { headers });
  }

  private getCookie(name: string): string {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return '';
  }
  
}