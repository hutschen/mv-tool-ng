import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvtool-upload-dialog',
  template: `
    <mat-label>File</mat-label>
    <button mat-raised-button (click)="fileInput.click()">
      {{ file ? file.name : 'Choose file' }}
    </button>
    <input
      hidden
      type="file"
      #fileInput
      (change)="onFileInput(fileInput.files)"
    />

    <button
      [disabled]="!file"
      type="submit"
      mat-raised-button
      color="primary"
      (click)="onSubmit()"
    >
      Submit
    </button>
  `,
  styles: [],
})
export class UploadDialogComponent {
  file: File | null = null;

  constructor() {}

  onFileInput(files: FileList | null): void {
    if (files) {
      this.file = files.item(0);
    }
  }

  onSubmit(): void {
    console.log(this.file);
  }
}
