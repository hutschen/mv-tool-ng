import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraProjectInputComponent } from './jira-project-input.component';

describe('JiraProjectInputComponent', () => {
  let component: JiraProjectInputComponent;
  let fixture: ComponentFixture<JiraProjectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JiraProjectInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JiraProjectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
