import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Document, DocumentService } from '../shared/services/document.service';
import { RequirementService } from '../shared/services/requirement.service';

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
  @Input() requirementId: number | null = null;
  @Input() documentId: number | null = null;
  @Output() documentIdChange = new EventEmitter<number | null>();
  documents: Document[] = [];

  constructor(
    protected _requirementService: RequirementService,
    protected _documentService: DocumentService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log(this.requirementId);
    if (this.requirementId) {
      const requirement = await this._requirementService.getRequirement(
        this.requirementId
      );
      this.documents = await this._documentService.listDocuments(
        requirement.project.id
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
