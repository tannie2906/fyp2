import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeletedFilesService {
  private deletedFilesKey = 'deletedFiles'; // Key to store files in localStorage

  constructor() {}

  // Add a deleted file to the service and localStorage
  addDeletedFile(file: any): void {
    const deletedFiles = this.getDeletedFiles(); // Get existing deleted files
    if (!deletedFiles.some(f => f.id === file.id)) {
      deletedFiles.push(file); // Add the new file only if it doesn't exist already
      localStorage.setItem(this.deletedFilesKey, JSON.stringify(deletedFiles)); // Persist in localStorage
    }
  }

  // Get deleted files from localStorage
  getDeletedFiles(): any[] {
    const deletedFiles = localStorage.getItem(this.deletedFilesKey);
    return deletedFiles ? JSON.parse(deletedFiles) : []; // Return parsed data or empty array if not found
  }

  // Restore a deleted file and remove from the deleted list
  restoreDeletedFile(fileId: string): void {
    let deletedFiles = this.getDeletedFiles();
    deletedFiles = deletedFiles.filter(f => f.id !== fileId); // Remove the file from deleted list
    localStorage.setItem(this.deletedFilesKey, JSON.stringify(deletedFiles)); // Update localStorage

    // Optionally, restore the file to its original list (not shown here)
  }

  // Clear all deleted files from localStorage (empty the bin)
  clearDeletedFiles(): void {
    localStorage.removeItem(this.deletedFilesKey);
  }
}
