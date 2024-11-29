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
    // Retrieve the list of deleted files from localStorage
    this.deletedFiles = this.deletedFilesService.getDeletedFiles();
  }
  

  // Restore file logic
  restoreFile(file: any): void {
    const index = this.deletedFiles.indexOf(file);
    if (index !== -1) {
      this.deletedFiles.splice(index, 1); // Remove the file from the deleted files list
      console.log('File restored:', file);
      // Optionally: You can also add code to restore the file to the original location here
    }
  }

  // Empty Bin logic
  emptyBin(): void {
    this.deletedFilesService.clearDeletedFiles(); // Clear deleted files from localStorage
    this.deletedFiles = []; // Clear the local array for display
    console.log('Bin emptied');
  }
}
