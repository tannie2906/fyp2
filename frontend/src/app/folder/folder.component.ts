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
  files: any[] = []; // Array to store file data
  errorMessage: string = ''; // For displaying errors

  constructor(private http: HttpClient, private authService: AuthService, private fileService: FileService) {}

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
}
