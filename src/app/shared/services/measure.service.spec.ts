import { TestBed } from '@angular/core/testing';

import { MeasureService } from './measure.service';

describe('MeasureService', () => {
  let service: MeasureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasureService);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
