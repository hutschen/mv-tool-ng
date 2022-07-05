import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDialogComponent } from './compliance-dialog.component';

describe('ComplianceDialogComponent', () => {
  let component: ComplianceDialogComponent;
  let fixture: ComponentFixture<ComplianceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplianceDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
