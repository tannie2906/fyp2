// src/app/upload/upload.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
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

  @Output() fileUploaded = new EventEmitter<void>();

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
    this.selectedFiles.forEach((file) => {
      formData.append('file', file);
    });

    const token = this.authService.getToken();

    if (!token) {
      alert('You are not authenticated. Please log in first.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Token ${token}`,
        },
      });

      const uploadedFile = response.data; // Assuming the API returns the uploaded file info
      console.log('File uploaded successfully:', uploadedFile);

      // Add file to shared file service
      this.fileService.addFile({
        id: Date.now(), // Example: generate a unique ID
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: 'unknown', // Example: default value for type
      });
      

      alert('File uploaded successfully!');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('Error uploading file:', axiosError.response.data);
      } else {
        console.error('Error uploading file:', axiosError);
      }
      alert('Error uploading file. Please try again.');
    }
  }
}