import { TestBed } from '@angular/core/testing';

import { RequirementService } from './requirement.service';

describe('RequirementService', () => {
  let service: RequirementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequirementService);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
