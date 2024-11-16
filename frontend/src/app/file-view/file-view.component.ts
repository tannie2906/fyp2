import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';  // To get route parameters
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { FileService } from '../services/file.service'; 

@Component({
  selector: 'app-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.css']
})
export class FileViewComponent implements OnInit {
  fileName: string | null = null;
  fileUrl: string | null = null; 

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    // Capture the fileName parameter from the route
    this.route.paramMap.subscribe(params => {
      this.fileName = params.get('fileName');
      
      // Assuming the fileService has a method to get the file URL or other data
      if (this.fileName) {
        this.getFileUrl(this.fileName);
      }
    });
  }

  getFileUrl(fileName: string): void {
    // Fetch the file URL from the service
    this.fileService.getFileUrl(fileName).subscribe(
      (response: { fileUrl: string }) => {
        this.fileUrl = response.fileUrl;  // Assuming the response contains the file URL
      },
      (error: any) => {  // Typing error as 'any' or more specific if needed
        console.error('Error fetching file URL:', error);
      }
    );
  }

  // Helper method to check if the file is an image based on the file extension
  isImage(fileUrl: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    return imageExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext));
  }

  // Load the file from the server
  loadFile(): void {
    const token = this.authService.getToken();
    if (!token) {
      alert('You are not authenticated.');
      return;
    }

    // Replace with your API URL to fetch the file URL
    this.http.get<{ fileUrl: string }>(`http://127.0.0.1:8000/api/files/${this.fileName}`, {
      headers: { 'Authorization': `Token ${token}` }
    })
    .subscribe(
      response => {
        this.fileUrl = response.fileUrl;  // Assume response contains the file URL
      },
      error => {
        console.error('Error fetching file:', error);
        alert('Error loading file.');
      }
    );
  }
}
