import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Document, DocumentService } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-document-input',
  template: `
    <div fxLayout="column">
      <mat-form-field appearance="fill">
        <mat-label>Select document</mat-label>
        <mat-select name="document" [(ngModel)]="documentId_">
          <mat-option>None</mat-option>
          <mat-option *ngFor="let document of documents" [value]="document.id">
            {{ document.reference | truncate }}
            {{ document.title | truncate }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [],
})
export class DocumentInputComponent implements OnInit {
  @Input() project: Project | null = null;
  @Input() documentId: number | null = null;
  @Output() documentIdChange = new EventEmitter<number | null>();
  documents: Document[] = [];

  constructor(protected _documentService: DocumentService) {}

  async ngOnInit(): Promise<void> {
    if (this.project) {
      this.documents = await this._documentService.listDocuments(
        this.project.id
      );
    }
  }

  get documentId_(): number | null {
    return this.documentId;
  }

  set documentId_(documentId: number | null) {
    this.documentIdChange.emit(documentId);
  }
}
