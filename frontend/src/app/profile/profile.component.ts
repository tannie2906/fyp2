import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
onFileChange($event: Event) {
throw new Error('Method not implemented.');
}
  profile: any = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    picture: null,
  }; 
  defaultProfilePicture = 'assets/images/profile.png'; // Placeholder image path
  router: any;
  selectedFile: File | null = null; // For file upload

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    // Subscribe to the shared profile state
    this.authService.profile$.subscribe((data) => {
      if (data) {
        this.profile = data;
      } else {
        const token = localStorage.getItem('auth_token');
        if (token) {
          this.authService.getProfile(token).subscribe();
        }
      }
    });
  }


  // Method to load profile data
  loadProfile(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (data) => {
          console.log('Profile Data:', data);
          this.profile = data; // Update the profile object
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
        },
      });
    }
  }

  // Method to update the username
  updateUsername(newUsername: string): void {
    this.settingsService.updateUsername(newUsername).subscribe({
      next: () => {
        console.log('Username updated successfully!');
        this.loadProfile(); // Reload the updated profile
      },
      error: (err) => {
        console.error('Error updating username:', err);
      },
    });
  }
}  