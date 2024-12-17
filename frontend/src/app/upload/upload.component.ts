import { Component, EventEmitter, Output } from '@angular/core';
import { FileService } from '../services/file.service'; // Ensure this service handles file upload
import { AuthService } from '../auth.service'; // Ensure the path to AuthService is correct
import axios, { AxiosError } from 'axios';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFiles: File[] = [];
  fileName: string = ''; // Variable for custom file name

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

    if (!this.fileName.trim()) {
      alert('Please provide a name for the file.');
      return;
    }

    const formData = new FormData();
    this.selectedFiles.forEach((file) => {
      formData.append('file', file);
      formData.append('name', this.fileName); // Add custom file name
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
        onUploadProgress: (progressEvent) => {
          if (progressEvent.loaded && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            console.log(`Upload Progress: ${progress}%`);
          } else {
            console.log(`Uploaded: ${progressEvent.loaded} bytes`);
          }
        },
      });

      console.log('File uploaded successfully:', response.data);

      this.fileUploaded.emit(); // Notify parent component
      alert('File uploaded successfully!');

      // Clear fields after successful upload
      this.selectedFiles = [];
      this.fileName = '';
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('Error uploading file:', axiosError.response.data);
        if (axiosError.response.status === 403) {
          alert('You do not have permission to upload files.');
        } else if (axiosError.response.status === 500) {
          alert('Server error. Please try again later.');
        } else {
          alert('Error uploading file. Please try again.');
        }
      } else {
        console.error('Error uploading file:', axiosError);
        alert('An unknown error occurred. Please try again.');
      }
    }
  }
}
