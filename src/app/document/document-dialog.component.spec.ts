import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDialogComponent } from './document-dialog.component';

describe('DocumentDialogComponent', () => {
  let component: DocumentDialogComponent;
  let fixture: ComponentFixture<DocumentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
