import { Component, OnInit } from '@angular/core';
//import { TestmodelService } from './testmodel.service';
import { Router } from '@angular/router';  // Add this import


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'frontend';
  testModels: any[] = [];

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);  // Navigate to the login page
  }

  onLogout() {
    // Clear the authentication token from localStorage
    localStorage.removeItem('auth_token');
    // Navigate the user to the home or login page
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
  }

  //search bar
  onSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    console.log('Search input:', input);
    // Perform live filtering or update a search term variable
  }
  
  onSearchClick(): void {
    console.log('Search button clicked');
    // Trigger a search function or filter the file/folder list
  }
  
  //ngOnInit() {
    //this.testModelService.getTestModels().subscribe((data) => {
      //this.testModels = data;
    //});
  //}
}
