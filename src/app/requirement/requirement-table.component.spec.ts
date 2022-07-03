import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementTableComponent } from './requirement-table.component';

describe('RequirementTableComponent', () => {
  let component: RequirementTableComponent;
  let fixture: ComponentFixture<RequirementTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequirementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
