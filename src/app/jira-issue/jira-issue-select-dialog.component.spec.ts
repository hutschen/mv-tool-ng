import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraIssueSelectDialogComponent } from './jira-issue-select-dialog.component';

describe('JiraIssueSelectDialogComponent', () => {
  let component: JiraIssueSelectDialogComponent;
  let fixture: ComponentFixture<JiraIssueSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JiraIssueSelectDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JiraIssueSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
