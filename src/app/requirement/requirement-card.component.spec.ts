import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementCardComponent } from './requirement-card.component';

describe('RequirementCardComponent', () => {
  let component: RequirementCardComponent;
  let fixture: ComponentFixture<RequirementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequirementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
