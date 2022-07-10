import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraIssueDialogComponent } from './jira-issue-dialog.component';

describe('JiraIssueDialogComponent', () => {
  let component: JiraIssueDialogComponent;
  let fixture: ComponentFixture<JiraIssueDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JiraIssueDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JiraIssueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
