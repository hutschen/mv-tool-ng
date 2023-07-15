// Copyright (C) 2023 Helmar Hutschenreuter
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

import { Injectable } from '@angular/core';
import { Interaction, InteractionService } from '../data/interaction';
import { Document, DocumentService } from './document.service';
import { Subject, firstValueFrom } from 'rxjs';
import { DocumentDialogService } from 'src/app/document/document-dialog.component';
import { ConfirmDialogService } from '../components/confirm-dialog.component';
import { Project } from './project.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentInteractionService
  implements InteractionService<Document>
{
  protected _interactionSubject = new Subject<Interaction<Document>>();
  readonly interactions$ = this._interactionSubject.asObservable();

  constructor(
    protected _documentService: DocumentService,
    protected _documentDialogService: DocumentDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  protected async _createOrEditDocument(project: Project, document?: Document) {
    const dialogRef = this._documentDialogService.openDocumentDialog(
      project,
      document
    );
    const resultingDocument = await firstValueFrom(dialogRef.afterClosed());
    if (resultingDocument) {
      this._interactionSubject.next({
        item: resultingDocument,
        action: document ? 'update' : 'add',
      });
    }
  }

  async onCreateDocument(project: Project): Promise<void> {
    await this._createOrEditDocument(project);
  }

  async onEditDocument(document: Document): Promise<void> {
    await this._createOrEditDocument(document.project, document);
  }

  async onDeleteDocument(document: Document): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Document',
      `Do you really want to delete the document "${document.title}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._documentService.deleteDocument(document.id));
      this._interactionSubject.next({ item: document, action: 'delete' });
    }
  }
}
