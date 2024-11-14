import { Component, OnInit } from '@angular/core';
import { TestmodelService } from './testmodel.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'frontend';
  testModels: any[] = [];

  constructor(private testModelService: TestmodelService) {}

  ngOnInit() {
    this.testModelService.getTestModels().subscribe((data) => {
      this.testModels = data;
    });
  }
}
