import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraIssueLabelComponent } from './jira-issue-label.component';

describe('JiraIssueLabelComponent', () => {
  let component: JiraIssueLabelComponent;
  let fixture: ComponentFixture<JiraIssueLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JiraIssueLabelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JiraIssueLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
