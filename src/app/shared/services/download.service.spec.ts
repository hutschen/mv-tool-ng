import { TestBed } from '@angular/core/testing';

import { DownloadService } from './download.service';

describe('DownloadService', () => {
  let service: DownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadService);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
