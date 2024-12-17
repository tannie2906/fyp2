import { Component, OnInit } from '@angular/core';
import { DeletedFilesService } from '../delete-files.service';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css'],
})
export class DeleteComponent implements OnInit {
  deletedFiles: any[] = []; // Array to hold deleted files
  selectedFiles: string[] = []; // IDs of selected files
file: any;

  constructor(private deletedFilesService: DeletedFilesService) {}

  ngOnInit(): void {
    this.loadDeletedFiles();
  }

  private loadDeletedFiles(): void {
    console.log('Fetching deleted files...');
    this.deletedFilesService.getDeletedFiles().subscribe(
      (data) => {
        console.log('Deleted files fetched:', data);
        this.deletedFiles = data;
      },
      (error) => {
        console.error('Error loading deleted files:', error);
        alert('Failed to load deleted files.');
      }
    );
  }

  // Toggle selection of individual file
  toggleSelection(fileId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedFiles.push(fileId);
    } else {
      this.selectedFiles = this.selectedFiles.filter((id) => id !== fileId);
    }
  }

  // Master checkbox to select/unselect all
  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedFiles = this.deletedFiles.map((file) => file.id);
    } else {
      this.selectedFiles = [];
    }
  }

  // Restore selected files
  restoreSelectedFiles(): void {
    if (this.selectedFiles.length === 0) {
      alert('No files selected for restoration.');
      return;
    }

    this.selectedFiles.forEach((fileId) => {
      this.deletedFilesService.restoreDeletedFile(fileId).subscribe({
        next: () => {
          this.deletedFiles = this.deletedFiles.filter((file) => file.id !== fileId);
          this.selectedFiles = this.selectedFiles.filter((id) => id !== fileId);
        },
        error: (error) => {
          console.error(`Error restoring file ${fileId}:`, error);
        },
      });
    });
  }

  // Restore a single file
  restoreFile(file: any): void {
    this.deletedFilesService.restoreDeletedFile(file.id).subscribe({
      next: () => {
        this.deletedFiles = this.deletedFiles.filter((f) => f.id !== file.id);
      },
      error: (error) => {
        console.error('Error restoring file:', error);
      },
    });
  }

  // Empty the entire bin
  emptyBin(): void {
    if (!confirm('Are you sure you want to empty the bin?')) return;

    this.deletedFilesService.clearDeletedFiles().subscribe({
      next: () => {
        this.deletedFiles = [];
        this.selectedFiles = [];
      },
      error: (error) => {
        console.error('Error emptying bin:', error);
      },
    });
  }

  deleteFilePermanently(file: any): void {
    const fileId = Number(file.id); // Ensure fileId is a number
    this.deletedFilesService.deletePermanently(fileId).subscribe({
      next: () => {
        // Remove the file from the local list
        this.deletedFiles = this.deletedFiles.filter((f) => f.id !== file.id);
        alert('File permanently deleted.');
      },
      error: (error) => {
        console.error('Error deleting file permanently:', error);
        alert('Failed to delete the file.');
      },
    });
  }
  
  

  deleteFile(file: any): void {
    const fileId = +file.id; // Convert string to number using + operator
    this.deletedFilesService.deletePermanently(fileId).subscribe({
      next: () => {
        this.deletedFiles = this.deletedFiles.filter(f => f.id !== file.id);
      },
      error: (error) => {
        console.error('Error deleting file:', error);
      }
    });
  }
}  
