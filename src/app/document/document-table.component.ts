import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DocumentService, Document } from '../shared/services/document.service';
import { DocumentDialogComponent } from './document-dialog.component';

@Component({
  selector: 'mvtool-document-table',
  templateUrl: './document-table.component.html',
  styles: [
  ]
})
export class DocumentTableComponent implements OnInit {
  displayedColumns: string[] = ['reference', 'title', 'description', 'options'];
  data: Document[] = [];
  dataLoaded: boolean = false
  @Input() projectId: number | null = null;
  // @Output() documentClicked = new EventEmitter<Document>()

  constructor(
    protected _documentService: DocumentService, 
    protected _dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadDocuments()
    this.dataLoaded = true
  }

  onCreateDocument(): void {
    let dialogRef = this._dialog.open(DocumentDialogComponent, {
      width: '500px',
      data: { projectId: this.projectId, document: null }
    })
    dialogRef.afterClosed().subscribe(async documentInput => {
      if (documentInput && this.projectId !== null) {
        await this._documentService.createDocument(
          this.projectId, documentInput)
        this.onReloadDocuments()
      }
    })
  }

  onEditDocument(document: Document): void {
    let dialogRef = this._dialog.open(DocumentDialogComponent, {
      width: '500px',
      data: { projectId: this.projectId, document: document }
    })
    dialogRef.afterClosed().subscribe(async documentInput => {
      if (documentInput && this.projectId !== null) {
        await this._documentService.updateDocument(
          this.projectId, documentInput)
        this.onReloadDocuments()
      }
    })
  }

  async onDeleteDocument(document: Document): Promise<void> {
    await this._documentService.deleteDocument(document.id)
    this.onReloadDocuments()
  }

  onExportDocuments(): void {}
  onImportDocuments(): void {}
  
  async onReloadDocuments(): Promise<void> {
    if (this.projectId !== null) {
      this.data = await this._documentService.listDocuments(
        this.projectId)
    }
  }
}
