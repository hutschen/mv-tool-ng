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
import { Project, ProjectService } from './project.service';
import {
  Observable,
  Subject,
  filter,
  firstValueFrom,
  map,
  startWith,
} from 'rxjs';
import { ProjectDialogService } from 'src/app/project/project-dialog.component';
import { ConfirmDialogService } from '../components/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ProjectInteractionService implements InteractionService<Project> {
  protected _interactionSubject = new Subject<Interaction<Project>>();
  readonly interactions$ = this._interactionSubject.asObservable();

  constructor(
    protected _projectService: ProjectService,
    protected _projectDialogService: ProjectDialogService,
    protected _confirmDialogService: ConfirmDialogService
  ) {}

  syncProject(project: Project): Observable<Project> {
    return this.interactions$.pipe(
      filter((interaction) => interaction.item.id === project.id),
      map((interaction) => interaction.item),
      startWith(project)
    );
  }

  protected async _createOrEditProject(project?: Project): Promise<void> {
    const dialogRef = this._projectDialogService.openProjectDialog(project);
    const resultingProject = await firstValueFrom(dialogRef.afterClosed());
    if (resultingProject) {
      this._interactionSubject.next({
        item: resultingProject,
        action: project ? 'update' : 'create',
      });
    }
  }

  async onCreateProject(): Promise<void> {
    await this._createOrEditProject();
  }

  async onEditProject(project: Project): Promise<void> {
    await this._createOrEditProject(project);
  }

  async onDeleteProject(project: Project): Promise<void> {
    const confirmDialogRef = this._confirmDialogService.openConfirmDialog(
      'Delete Project',
      `Do you really want to delete project "${project.name}"?`
    );
    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (confirmed) {
      await firstValueFrom(this._projectService.deleteProject(project.id));
      this._interactionSubject.next({ item: project, action: 'delete' });
    }
  }
}
