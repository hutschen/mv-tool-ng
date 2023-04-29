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
import { Measure, MeasureService } from './measure.service';
import { MeasureDialogService } from 'src/app/measure/measure-dialog.component';
import { ComplianceDialogService } from '../components/compliance-dialog.component';
import { CompletionDialogService } from 'src/app/measure/completion-dialog.component';
import { VerificationDialogService } from 'src/app/measure/verification-dialog.component';
import { ConfirmDialogService } from '../components/confirm-dialog.component';
import { Requirement } from './requirement.service';
import { Subject, firstValueFrom } from 'rxjs';
import { Interaction, InteractionService } from '../data/interaction';

@Injectable({
  providedIn: 'root',
})
export class MeasureInteractionService implements InteractionService<Measure> {
  protected _interactionsSubject = new Subject<Interaction<Measure>>();
  interactions$ = this._interactionsSubject.asObservable();

  constructor(
    protected _measureService: MeasureService,
    protected _measureDialogService: MeasureDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _completionDialogService: CompletionDialogService,
    protected _verificationDialogService: VerificationDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  protected async _createOrEditMeasure(
    requirement: Requirement,
    measure?: Measure
  ): Promise<void> {
    const dialogRef = this._measureDialogService.openMeasureDialog(
      requirement,
      measure
    );
    const resultingMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (resultingMeasure) {
      const action = measure ? 'update' : 'create';
      this._interactionsSubject.next({
        item: resultingMeasure,
        action: action,
      });
    }
  }

  async onCreateMeasure(requirement: Requirement): Promise<void> {
    await this._createOrEditMeasure(requirement);
  }

  async onEditMeasure(measure: Measure): Promise<void> {
    await this._createOrEditMeasure(measure.requirement, measure);
  }

  async onEditCompliance(measure: Measure): Promise<void> {
    const dialogRef =
      this._complianceDialogService.openComplianceDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this._interactionsSubject.next({
        item: updatedMeasure as Measure,
        action: 'update',
      });
    }
  }

  async onEditCompletion(measure: Measure): Promise<void> {
    const dialogRef =
      this._completionDialogService.openCompletionDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this._interactionsSubject.next({
        item: updatedMeasure,
        action: 'update',
      });
    }
  }

  async onEditVerification(measure: Measure): Promise<void> {
    const dialogRef =
      this._verificationDialogService.openVerificationDialog(measure);
    const updatedMeasure = await firstValueFrom(dialogRef.afterClosed());
    if (updatedMeasure) {
      this._interactionsSubject.next({
        item: updatedMeasure,
        action: 'update',
      });
    }
  }

  async onDeleteMeasure(measure: Measure): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Measure',
      `Do you really want to delete measure "${measure.summary}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._measureService.deleteMeasure(measure.id));
      this._interactionsSubject.next({ item: measure, action: 'delete' });
    }
  }
}
