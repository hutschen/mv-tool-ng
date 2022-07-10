import { TestBed } from '@angular/core/testing';

import { JiraIssueTypeService } from './jira-issue-type.service';

describe('JiraIssueTypeService', () => {
  let service: JiraIssueTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JiraIssueTypeService);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
