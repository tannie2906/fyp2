import { Component, OnInit } from '@angular/core';
import { DeletedFilesService } from '/Users/intan/testproject/frontend/src/app/delete-files.service'; // Import service

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent implements OnInit {
  deletedFiles: any[] = []; // Array to hold deleted files

  constructor(private deletedFilesService: DeletedFilesService) {}

  ngOnInit(): void {
    // Retrieve deleted files from the service
    this.deletedFiles = this.deletedFilesService.getDeletedFiles();
  }

  // Restore file logic
  restoreFile(file: any): void {
    const index = this.deletedFiles.indexOf(file);
    if (index !== -1) {
      this.deletedFiles.splice(index, 1); // Remove the file from the deleted files list
      console.log('File restored:', file);
    }
  }

  // Empty Bin logic
  emptyBin(): void {
    this.deletedFilesService.clearDeletedFiles(); // Clear all deleted files from the service
    this.deletedFiles = []; // Update the local array
    console.log('Bin emptied');
  }
}
