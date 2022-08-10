import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureCompleteButtonComponent } from './measure-complete-button.component';

describe('MeasureCompleteButtonComponent', () => {
  let component: MeasureCompleteButtonComponent;
  let fixture: ComponentFixture<MeasureCompleteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeasureCompleteButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeasureCompleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
