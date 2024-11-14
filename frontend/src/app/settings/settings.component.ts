import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  settings: any = {};

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getSettings(token).subscribe((data) => {
        this.settings = data;
      });
    }
  }

  updateSettings() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.updateSettings(token, this.settings).subscribe();
    }
  }
}
