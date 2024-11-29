import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css']
})
export class FolderComponent implements OnInit {

onDownload(_t23: any) {
throw new Error('Method not implemented.');
}

onShare(_t23: any) {
throw new Error('Method not implemented.');
}

onMove(_t23: any) {
throw new Error('Method not implemented.');
}

onDelete(_t23: any) {
throw new Error('Method not implemented.');
}

onRename(_t23: any) {
throw new Error('Method not implemented.');
}

onGetStartedClick() {
throw new Error('Method not implemented.');
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
  files: any[] = []; // Array to store file data
  errorMessage: string = ''; // For displaying errors

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private fileService: FileService) {}

    ngOnInit(): void {
      const token = this.authService.getToken();
      if (!token) {
        this.errorMessage = 'You are not authenticated. Please log in.';
        return;
      }
    
      // Fetch user-specific files
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

  // Reload files when a new file is uploaded
  onFileUploaded(): void {
    this.ngOnInit(); // Re-fetch files
  }

  logout(): void {
    this.authService.logout();
    this.files = [];
  }
  // Format the file size to a readable format (e.g., 2 KB, 3 MB)
  formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;  // If size is less than 1 KB
    } else if (size < 1048576) {
      return (size / 1024).toFixed(2) + ' KB';  // If size is less than 1 MB
    } else if (size < 1073741824) {
      return (size / 1048576).toFixed(2) + ' MB';  // If size is less than 1 GB
    } else {
      return (size / 1073741824).toFixed(2) + ' GB';  // If size is more than 1 GB
    }
  }
}
