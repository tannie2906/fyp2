import { Component, OnInit } from '@angular/core';
import { TestmodelService } from './testmodel.service';
import { Router } from '@angular/router';  // Add this import


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit  {
  title = 'frontend';
  testModels: any[] = [];

  constructor(private testModelService: TestmodelService, private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);  // Navigate to the login page
  }

  ngOnInit() {
    this.testModelService.getTestModels().subscribe((data) => {
      this.testModels = data;
    });
  }
}
