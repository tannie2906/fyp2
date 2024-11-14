import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private authService : AuthService, private route: Router) {}

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
