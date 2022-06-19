import { TestBed } from '@angular/core/testing';

import { JiraProjectService } from './jira-project.service';

describe('JiraProjectService', () => {
  let service: JiraProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JiraProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
