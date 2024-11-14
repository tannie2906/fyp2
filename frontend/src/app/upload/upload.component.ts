// src/app/upload/upload.component.ts
import { Component } from '@angular/core';
import { FileService } from '../services/file.service'; // Ensure this service handles file upload
import axios from 'axios';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFiles: File[] = [];
  fileName: string = '';

  constructor(private fileService: FileService) {}

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
  uploadFiles() {
    if (this.selectedFiles.length === 0) {
      alert('No files selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFiles[0]);  // Assumes single file upload

    axios.post('http://127.0.0.1:8000/api/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      console.log('File uploaded successfully:', response.data);
    })
    .catch(error => {
      console.error('Error uploading file:', error.response ? error.response.data : error);
    });
  }
}
