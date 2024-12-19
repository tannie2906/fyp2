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
  // Upload files
  async uploadFiles(): Promise<void> {
    // Check if any files are selected
    if (this.selectedFiles.length === 0) {
      alert('No files selected.');
      return;
    }

    // Check if a custom name is provided for the file
    if (!this.fileName.trim()) {
      alert('Please provide a name for the file.');
      return;
    }

    // Create a FormData object to send files to the server
    const formData = new FormData();
    this.selectedFiles.forEach((file) => {
      formData.append('file', file);  // Add the file to FormData
      formData.append('name', this.fileName);  // Add the custom name
    });

    // Get the authentication token
    const token = this.authService.getToken();

    // Check if the token exists (user is logged in)
    if (!token) {
      alert('You are not authenticated. Please log in first.');
      return;
    }

    try {
      // Send the files to the backend using axios POST request
      const response = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Set content type for file upload
          Authorization: `Token ${token}`,  // Attach the authentication token
        },
        // Handle upload progress
        onUploadProgress: (progressEvent) => {
          if (progressEvent.loaded && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            console.log(`Upload Progress: ${progress}%`);  // Show progress in the console
          } else {
            console.log(`Uploaded: ${progressEvent.loaded} bytes`); // Log bytes uploaded if total is not available
          }
        },
      });

      // On success, notify the parent component and clear the form
      console.log('File uploaded successfully:', response.data);
      this.fileUploaded.emit();  // Notify parent component
      alert('File uploaded successfully!');

      // Clear selected files and file name
      this.selectedFiles = [];
      this.fileName = '';

    } catch (error) {
      // Handle errors during the upload
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