import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementsExportDialogComponent } from './requirements-export-dialog.component';

describe('RequirementsExportDialogComponent', () => {
  let component: RequirementsExportDialogComponent;
  let fixture: ComponentFixture<RequirementsExportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequirementsExportDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequirementsExportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
