import { TestBed } from '@angular/core/testing';

import { JiraIssueService } from './jira-issue.service';

describe('JiraIssueService', () => {
  let service: JiraIssueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JiraIssueService);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
