import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureDialogComponent } from './measure-dialog.component';

describe('MeasureDialogComponent', () => {
  let component: MeasureDialogComponent;
  let fixture: ComponentFixture<MeasureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasureDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
