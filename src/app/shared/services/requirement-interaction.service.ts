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
import {
  ComplianceStatus,
  Requirement,
  RequirementService,
} from './requirement.service';
import {
  Observable,
  Subject,
  filter,
  firstValueFrom,
  map,
  startWith,
} from 'rxjs';
import { RequirementDialogService } from 'src/app/requirement/requirement-dialog.component';
import { ComplianceDialogService } from '../components/compliance-dialog.component';
import { ConfirmDialogService } from '../components/confirm-dialog.component';
import { Project } from './project.service';
import { ComplianceInteractionService } from '../compliance-interaction';

@Injectable({
  providedIn: 'root',
})
export class RequirementInteractionService
  implements InteractionService<Requirement>, ComplianceInteractionService
{
  protected _interactionsSubject = new Subject<Interaction<Requirement>>();
  readonly interactions$ = this._interactionsSubject.asObservable();

  constructor(
    protected _requirementService: RequirementService,
    protected _requirementDialogService: RequirementDialogService,
    protected _complianceDialogService: ComplianceDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  syncRequirement(requirement: Requirement): Observable<Requirement> {
    return this.interactions$.pipe(
      filter((interaction) => interaction.item.id === requirement.id),
      map((interaction) => interaction.item),
      startWith(requirement)
    );
  }

  protected async _createOrEditRequirement(
    project: Project,
    requirement?: Requirement
  ): Promise<void> {
    const dialogRef = this._requirementDialogService.openRequirementDialog(
      project,
      requirement
    );
    const resultingRequirement = await firstValueFrom(dialogRef.afterClosed());
    if (resultingRequirement) {
      this._interactionsSubject.next({
        item: resultingRequirement,
        action: requirement ? 'update' : 'add',
      });
    }
  }

  async onCreateRequirement(project: Project): Promise<void> {
    await this._createOrEditRequirement(project);
  }

  async onEditRequirement(requirement: Requirement): Promise<void> {
    await this._createOrEditRequirement(requirement.project, requirement);
  }

  async onEditCompliance(requirement: Requirement): Promise<void> {
    const dialogRef =
      this._complianceDialogService.openComplianceDialog(requirement);
    const updatedRequirement = await firstValueFrom(dialogRef.afterClosed());
    if (updatedRequirement) {
      this._interactionsSubject.next({
        item: updatedRequirement as Requirement,
        action: 'update',
      });
    }
  }

  async onDeleteRequirement(requirement: Requirement): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Requirement',
      `Do you really want to delete requirement "${requirement.summary}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(
        this._requirementService.deleteRequirement(requirement.id)
      );
      this._interactionsSubject.next({ item: requirement, action: 'delete' });
    }
  }

  async onSetComplianceStatus(
    requirement: Requirement,
    complianceStatus: ComplianceStatus | null
  ) {
    this._interactionsSubject.next({
      item: await firstValueFrom(
        this._requirementService.patchRequirement(requirement.id, {
          compliance_status: complianceStatus,
        })
      ),
      action: 'update',
    });
  }
}
