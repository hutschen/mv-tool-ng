// Copyright (C) 2022 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Document, DocumentService } from '../shared/services/document.service';
import { Project } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-document-input',
  template: `
    <div class="fx-column">
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
      this.documents = await this._documentService.listDocuments_legacy(
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
