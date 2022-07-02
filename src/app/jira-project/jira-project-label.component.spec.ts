import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraProjectLabelComponent } from './jira-project-label.component';

describe('JiraProjectLabelComponent', () => {
  let component: JiraProjectLabelComponent;
  let fixture: ComponentFixture<JiraProjectLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JiraProjectLabelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JiraProjectLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
