import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FileService } from '../services/file.service';

interface UserFile {
  name: string;
  size: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  userFiles: UserFile[] = [];
  isAuthenticated: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

    if (this.isAuthenticated) {
      // Fetch files if the user is authenticated
      this.fetchUserFiles();
    }
  }

  fetchUserFiles(): void {
    this.fileService.getUserFiles().subscribe(
      (files: { fileName: string }[]) => {
        // Transform the files to match the UserFile interface
        this.userFiles = files.map(file => ({
          name: file.fileName,
          size: 0 // Placeholder for size, as it's not provided. Update if the size is available from the backend
        }));
      },
      (error: any) => {
        console.error('Error fetching files:', error);
      }
    );
  }

  onGetStartedClick(): void {
    if (this.authService.isAuthenticated()) {
      // User is logged in, redirect to upload page
      this.router.navigate(['/upload']); // Ensure the "upload" route exists in your routing module
    } else {
      // User is not logged in, redirect to login page
      this.router.navigate(['/login']);
    }
  }

  onCreateFolder() {
    console.log("Folder creation triggered")
  }

  onCreateDocument() {
    // Logic to create a document
    console.log("Document creation triggered");
  }
}
