import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { FileService, File } from '../services/file.service';
import { Router } from '@angular/router';
import { DeletedFilesService } from '../delete-files.service'; // Path should match
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css']
})
export class FolderComponent implements OnInit {
  files: any[] = []; // Array to store file data
  errorMessage: string = ''; // For displaying errors
  deletedFiles: any[] = [];
  folderFiles: File[] = [];

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private fileService: FileService,
    private router: Router,
    private deletedFilesService: DeletedFilesService
  ) {}

  ngOnInit(): void {
    
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'You are not authenticated. Please log in.';
      return;
    }

    // Fetch all files
    this.fileService.getFiles().subscribe(
      (data) => {
        this.files = data;
      },
      (error) => {
        console.error('Error fetching files:', error);
        this.errorMessage = 'Failed to load files. Please try again later.';
      }
    );

    // Fetch deleted files
    this.fileService.getDeletedFiles().subscribe(
      (data) => {
        this.deletedFiles = data;
      },
      (error) => {
        console.error('Error fetching deleted files:', error);
        this.errorMessage = 'Failed to load deleted files.';
      }
    );
  }


  // Handle file deletion
  onDelete(file: any, event: Event): void {
    event.preventDefault();
    this.fileService.deleteFile(file.id).subscribe({
      next: () => {
        this.files = this.files.filter(f => f.id !== file.id);
        this.deletedFiles.push(file); // Add file to deleted list
      },
      error: (error) => {
        console.error('Error deleting file:', error);
        alert('Failed to delete the file. Please try again.');
      }
    });
  }

  goToBin(): void {
    this.router.navigate(['/delete']);
  }


  // Utility to format the file size to a readable format
  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`;
    return `${(size / 1073741824).toFixed(2)} GB`;
  }

  // File download functionality
  onDownload(file: File, event: Event): void {
    event.preventDefault();
    const token = this.authService.getToken(); // Retrieve the token from AuthService
  
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return;
    }
  
    const fileUrl = `http://127.0.0.1:8000/api/files/download/${file.id}/`;
  
    // Send request with Authorization header
    this.http
      .get(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Expect a file response
      })
      .subscribe({
        next: (blob) => {
          // Create a link to download the file
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name; // Filename from the file object
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error downloading file:', error);
          alert('Failed to download the file. Please try again.');
        },
      });
  }
  

  onShare(_t23: any) {
    throw new Error('Method not implemented.');
  }

  onMove(_t23: any) {
    throw new Error('Method not implemented.');
  }

  onRename(file: any): void {
    const newName = prompt('Enter a new name for the file:', file.filename);

    if (newName && newName.trim() !== '' && newName !== file.filename) {
        this.fileService.renameFile(file.id, newName).subscribe({
            next: (response) => {
                file.filename = newName; // Update the UI with new name
                alert('File renamed successfully!');
            },
            error: (error) => {
                console.error('Error renaming file:', error);
                alert(error.error?.message || 'Failed to rename the file. Please try again.');
            }
        });
    } else if (newName === file.filename) {
        alert('The new name is the same as the current name.');
    }
  }

  onGetStartedClick(): void {
    this.router.navigate(['/upload']);  // Routes to the upload page (similar to the HomeComponent)
  }

  onUploadClick() {
    throw new Error('Method not implemented.');
  }

  onCreateDocument() {
    throw new Error('Method not implemented.');
  }

  onCreateFolder() {
    throw new Error('Method not implemented.');
  }

  // Fetch files using the service
  getFolderFiles(): void {
    this.fileService.getFolderFiles().subscribe({
        next: (files: File[]) => {
            this.folderFiles = files; // Update the local array
        },
        error: (error: HttpErrorResponse) => {
            console.error('Error fetching files:', error.message);
        },
    });
}

    // Delete a file and refresh the file list
    deleteFile(file: File): void {
      this.fileService.deleteFile(file.id).subscribe({
          next: () => {
              // Option 1: Refetch the file list
              this.getFolderFiles();

              // Option 2: Remove the deleted file locally (if you don't want to refetch)
              // this.folderFiles = this.folderFiles.filter(f => f.id !== file.id);
          },
          error: (error: HttpErrorResponse) => {
              console.error('Error deleting file:', error.message);
          },
      });
  }
}