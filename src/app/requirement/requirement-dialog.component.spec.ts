import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementDialogComponent } from './requirement-dialog.component';

describe('RequirementDialogComponent', () => {
  let component: RequirementDialogComponent;
  let fixture: ComponentFixture<RequirementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequirementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
