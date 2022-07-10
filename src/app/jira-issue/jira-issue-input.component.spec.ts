import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraIssueInputComponent } from './jira-issue-input.component';

describe('JiraIssueInputComponent', () => {
  let component: JiraIssueInputComponent;
  let fixture: ComponentFixture<JiraIssueInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JiraIssueInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JiraIssueInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
