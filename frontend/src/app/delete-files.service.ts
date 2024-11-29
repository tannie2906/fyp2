import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeletedFilesService {
  private deletedFiles: any[] = [];

  // Get all deleted files
  getDeletedFiles(): any[] {
    return this.deletedFiles;
  }

  // Add a file to the deleted files list
  addDeletedFile(file: any): void {
    this.deletedFiles.push(file);
  }

  // Clear all deleted files
  clearDeletedFiles(): void {
    this.deletedFiles = [];
  }
}
