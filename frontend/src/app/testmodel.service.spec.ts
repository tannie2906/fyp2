import { TestBed } from '@angular/core/testing';

import { TestmodelService } from './testmodel.service';

describe('TestmodelService', () => {
  let service: TestmodelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestmodelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
