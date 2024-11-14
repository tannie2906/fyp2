// src/app/upload/upload.component.ts
import { Component } from '@angular/core';
import { FileService } from '../services/file.service'; // Ensure this service handles file upload

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
  uploadFiles(): void {
    if (this.fileName.trim() === '') {
      alert('Please provide a file name.');
      return;
    }

    if (this.selectedFiles.length === 0) {
      alert('Please select a file to upload.');
      return;
    }

    this.selectedFiles.forEach(file => {
      this.fileService.uploadFile(file, this.fileName).subscribe(
        (response) => {
          alert('File uploaded successfully!');
          this.fileName = '';
          this.selectedFiles = [];
        },
        (error) => {
          alert('Error uploading file: ' + error.message);
        }
      );
    });
  }
}
