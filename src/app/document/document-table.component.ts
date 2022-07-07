import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DocumentService, Document } from '../shared/services/document.service';
import { DocumentDialogComponent } from './document-dialog.component';

@Component({
  selector: 'mvtool-document-table',
  templateUrl: './document-table.component.html',
  styles: [
  ]
})
export class DocumentTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['reference', 'title', 'description', 'options'];
  dataSource = new MatTableDataSource<Document>()
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @Input() projectId: number | null = null;
  @Output() documentClicked = new EventEmitter<Document>()

  constructor(
    protected _documentService: DocumentService, 
    protected _route: ActivatedRoute,
    protected _dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadDocuments()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onDocumentClicked(document: Document): void {
    this.documentClicked.emit(document)
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

  onFilterDocuments(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onExportDocuments(): void {}
  onImportDocuments(): void {}
  
  async onReloadDocuments(): Promise<void> {
    if (this.projectId !== null) {
      this.dataSource.data = await this._documentService.listDocuments(
        this.projectId)
    }
  }
}
