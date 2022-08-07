import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DocumentService, Document } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';
import {
  DocumentDialogComponent,
  IDocumentDialogData,
} from './document-dialog.component';

@Component({
  selector: 'mvtool-document-table',
  templateUrl: './document-table.component.html',
  styles: [],
})
export class DocumentTableComponent implements OnInit {
  displayedColumns: string[] = ['reference', 'title', 'description', 'options'];
  data: Document[] = [];
  dataLoaded: boolean = false;
  @Input() project: Project | null = null;
  // @Output() documentClicked = new EventEmitter<Document>()

  constructor(
    protected _documentService: DocumentService,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadDocuments();
    this.dataLoaded = true;
  }

  onCreateDocument(): void {
    let dialogRef = this._dialog.open(DocumentDialogComponent, {
      width: '500px',
      data: { project: this.project, document: null } as IDocumentDialogData,
    });
    dialogRef.afterClosed().subscribe(async (documentInput) => {
      if (documentInput && this.project) {
        await this._documentService.createDocument(
          this.project.id,
          documentInput
        );
        this.onReloadDocuments();
      }
    });
  }

  onEditDocument(document: Document): void {
    let dialogRef = this._dialog.open(DocumentDialogComponent, {
      width: '500px',
      data: {
        project: this.project,
        document: document,
      } as IDocumentDialogData,
    });
    dialogRef.afterClosed().subscribe(async (documentInput) => {
      if (documentInput) {
        await this._documentService.updateDocument(document.id, documentInput);
        this.onReloadDocuments();
      }
    });
  }

  async onDeleteDocument(document: Document): Promise<void> {
    await this._documentService.deleteDocument(document.id);
    this.onReloadDocuments();
  }

  onExportDocuments(): void {}
  onImportDocuments(): void {}

  async onReloadDocuments(): Promise<void> {
    if (this.project) {
      this.data = await this._documentService.listDocuments(this.project.id);
    }
  }
}
