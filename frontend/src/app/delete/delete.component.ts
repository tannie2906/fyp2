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
  selectedFiles: number[] = []; // IDs of selected files
  allSelected = false;

  constructor(
    private folderService: FolderService, 
    private authService: AuthService
  ) {}

  // Helper function to retrieve CSRF token from cookies
  private getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }

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
    const headers = new HttpHeaders().set('Authorization', `Token ${this.authService.getToken() || ''}`);
    
    this.folderService.getDeletedFiles(this.userId, headers).subscribe(
      (files: any[]) => {
        console.log('Fetched Deleted Files:', files); // Debug log
        this.deletedFiles = files || []; // Handle empty response
      },
      (error) => {
        console.error('Error fetching deleted files:', error);
      }
    );
  }
  
  // Restore a file
  restoreFile(fileId: number): void {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCookie('csrftoken')); // Include CSRF token
  
    // Wrap the single file ID in an array
    this.folderService.restoreFiles([fileId], headers).subscribe(
      () => {
        console.log('File restored successfully!');
        this.fetchDeletedFiles(); // Refresh the list after restoration
      },
      (error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.error('File not found. It may have been permanently deleted or does not exist.');
        } else {
          console.error('Error restoring file:', error.message);
        }
      }
    );
  }
  
   // Restore selected files
  restoreSelectedFiles(): void {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCookie('csrftoken')); // Include CSRF token
    const fileIds = this.selectedFiles; // Array of selected file IDs

    if (!fileIds.length) {
      console.warn('No files selected for restoration.');
      return;
    }

    this.folderService.restoreFiles(fileIds, headers).subscribe(
      (response) => {
        console.log(`Restored ${fileIds.length} files successfully:`, response.message);
        this.fetchDeletedFiles(); // Refresh the deleted files list
        this.selectedFiles = []; // Clear the selection after successful restoration
        this.allSelected = false; // Reset the master checkbox
      },
      (error: HttpErrorResponse) => {
        console.error('Error restoring selected files:', error.message);
      }
    );
  }

  // Permanently delete a file
  permanentlyDeleteFile(fileId: number): void {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCookie('csrftoken')); // Include CSRF token
  
    // Use the correct method name (permanentlyDeleteFile)
    this.folderService.permanentlyDeleteFile(fileId, headers).subscribe(
      () => {
        this.fetchDeletedFiles(); // Refresh the list after permanent deletion
      },
      (error: HttpErrorResponse) => { // Explicitly type the error parameter
        console.error('Error permanently deleting file:', error.message);
      }
    );
  }

// Delete selected files permanently
deleteSelectedFiles(): void {
  const headers = new HttpHeaders().set('X-CSRFToken', this.getCookie('csrftoken'));

  if (this.selectedFiles.length > 0) {
    // Iterate over selected files
    this.selectedFiles.forEach((fileId) => {
      this.folderService.permanentlyDeleteFile(fileId, headers).subscribe(
        () => {
          this.fetchDeletedFiles(); // Refresh the list after permanent deletion
        },
        (error: HttpErrorResponse) => { // Explicitly type the error parameter
          console.error(`Error permanently deleting file with ID ${fileId}:`, error.message);
        }
      );
    });
  } else {
    console.warn('No files selected for deletion.');
  }
}

  // Empty the trash
  emptyTrash(): void {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCookie('csrftoken'));
    this.folderService.emptyTrash(headers).subscribe(
      () => {
        this.fetchDeletedFiles(); // Refresh the list after emptying trash
      },
      (error) => {
        console.error('Error emptying trash:', error);
      }
    );
  }

  // Toggle selection of an individual file
  toggleSelection(fileId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedFiles.push(fileId);
    } else {
      this.selectedFiles = this.selectedFiles.filter((id) => id !== fileId);
    }
    this.updateSelectAllState();
  }
  
  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allSelected = isChecked;
  
    if (isChecked) {
      this.selectedFiles = this.deletedFiles.map((file) => file.id);
    } else {
      this.selectedFiles = [];
    }
  }
  
  updateSelectAllState(): void {
    this.allSelected =
      this.selectedFiles.length === this.deletedFiles.length &&
      this.selectedFiles.length > 0;
  }
}

  

