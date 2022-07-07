import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureTableComponent } from './measure-table.component';

describe('MeasureTableComponent', () => {
  let component: MeasureTableComponent;
  let fixture: ComponentFixture<MeasureTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasureTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasureTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
