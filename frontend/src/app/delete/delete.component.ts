import { Component, OnInit } from '@angular/core';
import { DeletedFilesService } from '../delete-files.service'; 


@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent implements OnInit {
  deletedFiles: any[] = []; // Array to hold deleted files

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

  restoreFile(file: any): void {
    this.deletedFilesService.restoreDeletedFile(file.id).subscribe({
      next: () => {
        this.deletedFiles = this.deletedFiles.filter(f => f.id !== file.id);
      },
      error: (error) => {
        console.error('Error restoring file:', error);
      }
    });
  }

  emptyBin(): void {
    this.deletedFilesService.clearDeletedFiles().subscribe({
      next: () => {
        this.deletedFiles = [];
      },
      error: (error) => {
        console.error('Error emptying bin:', error);
      }
    });
  }
}

