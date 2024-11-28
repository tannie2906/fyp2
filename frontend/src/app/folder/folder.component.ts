import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';  // Import HttpClient
import { AuthService } from '../auth.service';  // For authentication handling
import { FileService } from '../services/file.service';


@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css']
})
export class FolderComponent implements OnInit {
  files: any[] = []; // Array to store file data

  constructor(private http: HttpClient, private authService: AuthService, private fileService: FileService) {}

  ngOnInit(): void {
    this.fileService.getFiles().subscribe(
      (data) => {
        this.files = data; // Store fetched data
      },
      (error) => {
        console.error('Error:', error);
      }
    );
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
        this.files = response.files;  // Store the file list in the uploadedFiles array
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
