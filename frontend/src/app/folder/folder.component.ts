import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';  // Import HttpClient
import { AuthService } from '../auth.service';  // For authentication handling

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css']
})
export class FolderComponent implements OnInit {
  uploadedFiles: string[] = [];  // Array to store list of file names

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUploadedFiles();  // Load files when the component initializes
  }

  // Fetch uploaded files from the backend
  loadUploadedFiles(): void {
    const token = this.authService.getToken();  // Get the token from localStorage

    if (!token) {
      alert('You are not authenticated. Please log in first.');
      return;
    }

    // Send a GET request to the backend to fetch the list of files
    this.http.get<{ files: string[] }>('http://127.0.0.1:8000/api/files/', {
      headers: {
        'Authorization': `Token ${token}`  // Include the token in the Authorization header
      }
    })
    .subscribe(
      response => {
        this.uploadedFiles = response.files;  // Store the file list in the uploadedFiles array
      },
      error => {
        console.error('Error fetching uploaded files:', error);
        alert('Error fetching files.');
      }
    );
  }

  // Reload the files when a new file is uploaded
  onFileUploaded(): void {
    this.loadUploadedFiles();  // Reload the files list
  }
}
