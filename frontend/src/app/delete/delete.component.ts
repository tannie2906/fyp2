import { Component, OnInit } from '@angular/core';
import { DeletedFilesService } from '../delete-files.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FolderService } from '../folder.service'; 
import { AuthService } from '../auth.service';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css'],
})

export class DeleteComponent implements OnInit {
  deletedFiles: any[] = []; // Array to hold deleted files
  userId!: string;

  constructor(
    private folderService: FolderService, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchDeletedFiles();
    this.getUserIdAndFetchDeletedFiles();
  }

  // Fetch user ID from the AuthService and then fetch deleted files
  getUserIdAndFetchDeletedFiles(): void {
    this.authService.getProfile(this.authService.getToken() || '').subscribe(
      (profile) => {
        this.userId = profile.id;  // Ensure the correct field name is used for user ID
        if (this.userId) {
          this.fetchDeletedFiles();  // Only call if userId is valid
        } else {
          console.error('User ID is undefined!');
        }
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      }
    );
  }

  // Fetch deleted files from the API for the current logged-in user
  fetchDeletedFiles(): void {
    if (!this.userId) {
      console.error('User ID is not set.');
      return;
    }

    // Create headers including the Authorization token
    const headers = new HttpHeaders().set('Authorization', `Token ${this.authService.getToken() || ''}`);

    // Pass userId and headers to the folderService
    this.folderService.getDeletedFiles(this.userId, headers).subscribe(
      (files: any[]) => {
        this.deletedFiles = files;  // Assign fetched files to the array
      },
      (error) => {
        console.error('Error fetching deleted files:', error);
      }
    );
  }

  // Restore a file
  restoreFile(fileId: number): void {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCookie('csrftoken')); // Include CSRF token
    this.folderService.restoreFile(fileId, headers).subscribe(
      () => {
        this.fetchDeletedFiles(); // Refresh the list after restoration
      },
      (error) => {
        console.error('Error restoring file:', error);
      }
    );
  }

  // Permanently delete a file
  permanentlyDeleteFile(fileId: number): void {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCookie('csrftoken')); // Include CSRF token
    this.folderService.permanentlyDeleteFile(fileId, headers).subscribe(
      () => {
        this.fetchDeletedFiles(); // Refresh the list after permanent deletion
      },
      (error) => {
        console.error('Error permanently deleting file:', error);
      }
    );
  }

  // Empty the trash
  emptyTrash(): void {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCookie('csrftoken')); // Include CSRF token
    this.folderService.emptyTrash(headers).subscribe(
      () => {
        this.fetchDeletedFiles(); // Refresh the list after emptying trash
      },
      (error) => {
        console.error('Error emptying trash:', error);
      }
    );
  }

  // Helper function to retrieve CSRF token from cookies
  private getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }
}

  

