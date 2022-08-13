import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadDialogComponent } from './download-dialog.component';

describe('DownloadDialogComponent', () => {
  let component: DownloadDialogComponent;
  let fixture: ComponentFixture<DownloadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DownloadDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
