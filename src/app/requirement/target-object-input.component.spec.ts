import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetObjectInputComponent } from './target-object-input.component';

describe('TargetObjectInputComponent', () => {
  let component: TargetObjectInputComponent;
  let fixture: ComponentFixture<TargetObjectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TargetObjectInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetObjectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
