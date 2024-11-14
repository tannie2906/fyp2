import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userFiles: Array<{ name: string; size: number }> = [];
  isAuthenticated: boolean = false;

  constructor(
    private authService : AuthService, 
    private route: Router, 
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
      (files) => {
        this.userFiles = files;
      },
      (error) => {
        console.error('Error fetching files:', error);
      }
    );
  }

  onGetStartedClick() : void {
    if (this.authService.isAuthenticated()) {
      // User is logged in, redirect to upload page (or wherever they can upload files)
      this.route.navigate(['/upload']); // Make sure to create an "upload" route
    } else {
      // User is not logged in, redirect to login page
      this.route.navigate(['/login']);
    }
  }

}
