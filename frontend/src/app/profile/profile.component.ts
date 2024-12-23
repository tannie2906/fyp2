import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profile: any = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  }; // mean it will hold user profile data
  router: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('auth_token'); // Correct the key here
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: (data) => {
          console.log('Profile Data:', data); // Verify response
          this.profile = data;
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
        },
      });
    } else {
      console.error('No token found in localStorage!');
      this.router.navigate(['/login']); // Redirect to login if token is missing
    }
  }
}  