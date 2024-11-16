// src/app/upload/upload.component.ts
import { Component } from '@angular/core';
import { FileService } from '../services/file.service'; // Ensure this service handles file upload
//import axios from 'axios';
import { AuthService } from '../auth.service'; // Ensure the path to AuthService is correct
import axios, { AxiosError } from 'axios'; 

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFiles: File[] = [];
  fileName: string = '';

  constructor(private fileService: FileService, private authService: AuthService) {}

  // Handle file selection
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  // Handle file drop
  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files) {
      this.selectedFiles = Array.from(event.dataTransfer.files);
    }
  }

  // Prevent default behavior on drag over
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Upload files
  async uploadFiles(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      alert('No files selected.');
      return;
    }
  
    const formData = new FormData();
    // Append each selected file to FormData
    this.selectedFiles.forEach(file => {
      formData.append('file', file);
    });
  
    const token = this.authService.getToken();  // Get the token from localStorage
  
    if (!token) {
      alert('You are not authenticated. Please log in first.');
      return;
    }
  
    try {
      // Make the POST request to upload files
      const response = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Ensure correct content type
          'Authorization': `Token ${token}`       // Include the token in the header
        }
      });
      console.log('File uploaded successfully:', response.data);
      alert('File uploaded successfully!');
    } catch (error) {
      // Type-cast the error to AxiosError
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Type assertion to treat response.data as an object with an error property
        const errorData = axiosError.response.data as { error?: string };
        alert(`Error: ${errorData.error || 'Upload failed.'}`);
      } else {
        console.error('Error uploading file:', axiosError);
        alert('An unexpected error occurred. Please try again.');
      }
    }
  }
}
