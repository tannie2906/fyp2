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
  showStarredFiles: boolean = false; // To toggle between main and starred view
  starredFiles: any[] = []; // Holds starred files

  // To track sort order for each column
  sortOrder: { [key: string]: 'asc' | 'desc' } = {
    name: 'asc',
    size: 'asc',
    modified: 'asc',
  };
  isAuthenticated: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fileService: FileService,
    private router: Router,
    private deletedFilesService: DeletedFilesService
  ) {}

  ngOnInit(): void {
    // Check if the user is authenticated by checking the token in AuthService
    this.isAuthenticated = !!this.authService.getToken();
    this.fetchFiles();          // Loads all files
    this.fetchStarredFiles(); 
    this.loadDeletedFiles();
    
    if (!this.isAuthenticated) {
      this.errorMessage = 'You are not authenticated. Please log in.';
    }

    // Fetch all files only if authenticated
    if (this.isAuthenticated) {
      this.fileService.getFiles().subscribe(
        (data) => {
          this.files = data;
        },
        (error) => {
          console.error('Error fetching files:', error);
          this.errorMessage = 'Failed to load files. Please try again later.';
        }
      );
    }

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

  fetchFiles(): void {
    this.fileService.getFiles().subscribe({
      next: (data) => {
        console.log('Files:', data);
        this.files = data; // Files now include correct isStarred status
      },
      error: (error) => {
        console.error('Error fetching files:', error);
      }
    });
  }

  // Sort files by column
  sortFiles(column: string): void {
    this.sortOrder[column] = this.sortOrder[column] === 'asc' ? 'desc' : 'asc';

    switch (column) {
      case 'name':
        this.files.sort((a, b) =>
          this.sortOrder['name'] === 'asc'
            ? a.filename.localeCompare(b.filename)
            : b.filename.localeCompare(a.filename)
        );
        break;
      case 'size':
        this.files.sort((a, b) =>
          this.sortOrder['size'] === 'asc' ? a.size - b.size : b.size - a.size
        );
        break;
      case 'modified':
        this.files.sort((a, b) =>
          this.sortOrder['modified'] === 'asc'
            ? new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
            : new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
        );
        break;
    }
  }

  // Toggle dropdown visibility for a file
  toggleDropdown(file: any): void {
    file.showDropdown = !file.showDropdown;
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
          console.log('Rename Successful Response:', response);
          file.filename = newName; // Update local UI with new filename
          alert('File renamed successfully!');
        },
        error: (error) => {
          console.error('Rename Failed - Error Response:', error);
          alert(error.error?.error || 'Failed to rename the file. Please try again.');
        }
      });
         
    } else if (newName === file.filename) {
      alert('The new name is the same as the current name.');
    }
  }  

  // Method to fetch deleted files
  loadDeletedFiles(): void {
    this.fileService.getDeletedFiles().subscribe({
      next: (files) => {
        this.deletedFiles = files;
        console.log('Deleted files loaded:', this.deletedFiles);
      },
      error: (error) => {
        console.error('Error fetching deleted files:', error);
      }
    });
  }

  permanentlyDelete(file: File): void {
    this.fileService.permanentlyDeleteFile(file.id).subscribe({
      next: () => {
        console.log('File permanently deleted.');
        this.loadDeletedFiles(); // Refresh the list of deleted files
      },
      error: (error) => {
        console.error('Permanent delete error:', error);
      },
    });
  }
  

  onGetStartedClick(): void {
    this.router.navigate(['/upload']);  // Routes to the upload page (similar to the HomeComponent)
  }

  onUploadClick(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/upload']);
    } else {
      this.router.navigate(['/login']);
    }
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

  // Navigate to Starred Files
  goToStarred(): void {
    this.showStarredFiles = true;
    this.fetchStarredFiles();
  }

  // Fetch Starred Files
  fetchStarredFiles(): void {
    this.fileService.getStarredFiles().subscribe({
      next: (data) => {
        console.log('Fetched Starred Files:', data);
        this.starredFiles = data;
      },
      error: (error) => {
        console.error('Error fetching starred files:', error);
      }
    });
  }
  
  toggleStar(file: any): void {
    const previousState = file.isStarred;
    file.isStarred = !file.isStarred;
  
    if (file.isStarred) {
      this.starredFiles.push(file); // Add to starred list
    } else {
      this.starredFiles = this.starredFiles.filter(f => f.id !== file.id);
    }
  
    this.fileService.toggleStar(file.id, file.isStarred).subscribe({
      next: () => console.log('Star status updated'),
      error: (error) => {
        console.error('Error toggling star:', error);
        file.isStarred = previousState; // Revert on failure
        this.fetchStarredFiles(); // Refetch as a fallback
      }
    });
  }
  

  toggleStarredView(): void {
    this.showStarredFiles = !this.showStarredFiles;
    if (this.showStarredFiles) {
      this.fetchStarredFiles();
    }
  }
  
}