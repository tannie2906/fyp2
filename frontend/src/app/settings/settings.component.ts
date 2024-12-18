import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { SettingsService } from '/Users/intan/testproject/frontend/src/app/services/settings.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})

export class SettingsComponent implements OnInit {
  settings: any = {};
  username: string = '';             // Initialize with an empty string
  currentPassword: string = '';      // Initialize with an empty string
  newPassword: string = '';          // Initialize with an empty string
  confirmPassword: string = '';

  constructor(private authService: AuthService, private settingsService: SettingsService ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getSettings(token).subscribe((data) => {
        this.settings = data;
        this.username = 'CurrentUsername';
      });
    }
  }

  saveChanges() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    // Update username
    this.settingsService.updateUsername(this.username).subscribe(
      (response) => {
        alert('Username updated successfully');
      },
      (error) => {
        console.error('Error updating username', error);
        alert('Failed to update username');
      }
    );
  
    // Update password
    if (this.newPassword) {
      this.settingsService.updatePassword(this.currentPassword, this.newPassword).subscribe(
        (response) => {
          alert('Password updated successfully');
        },
        (error) => {
          console.error('Error updating password', error);
          alert('Failed to update password');
        }
      );
    }
  }  

  updateSettings() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.updateSettings(token, this.settings).subscribe();
    }
  }
  updateUsername(newUsername: string): void {
    this.settingsService.updateUsername(newUsername).subscribe({
      next: () => console.log('Username updated successfully'),
      error: (err) => console.error('Failed to update username', err),
    });
  }

  updateName(firstName: string, lastName: string): void {
    this.settingsService.updateNameDetails(firstName, lastName).subscribe({
      next: () => console.log('Name details updated successfully'),
      error: (err) => console.error('Failed to update name details', err),
    });
  }
}
