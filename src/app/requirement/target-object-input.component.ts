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
import { Project } from '../shared/services/project.service';
import { RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-target-object-input',
  template: `
    <div class="fx-column">
      <mat-form-field appearance="fill">
        <mat-label>Target object</mat-label>
        <input
          type="text"
          matInput
          [(ngModel)]="filterValue"
          [matAutocomplete]="targetObjectAutocomplete"
        />
        <mat-autocomplete #targetObjectAutocomplete="matAutocomplete">
          <mat-option
            *ngFor="let targetObject of filteredTargetObjects"
            [value]="targetObject"
          >
            {{ targetObject }}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.css'],
  styles: [],
})
export class TargetObjectInputComponent implements OnInit {
  @Input() project?: Project;
  @Input() targetObject?: string | null;
  @Output() targetObjectChange = new EventEmitter<string | null | undefined>();
  targetObjects: string[] = [];
  filteredTargetObjects: string[] = [];

  constructor(protected _requirementService: RequirementService) {}

  async ngOnInit(): Promise<void> {
    if (this.project) {
      const requirements =
        await this._requirementService.listRequirements_legacy(this.project.id);
      this.targetObjects = <string[]>requirements
        .map(
          (r) => r.target_object // collect all target objects
        )
        .filter(
          (to) => to // remove undefined, null and empty strings
        )
        .filter(
          (to, index, self) => self.indexOf(to) === index // remove duplicates
        );
    }
  }

  get filterValue(): string | null | undefined {
    return this.targetObject;
  }

  set filterValue(value: string | null | undefined) {
    if (value) {
      this.filteredTargetObjects = this._filterTargetObjects(value);
    }
    this.targetObject = value;
    this.targetObjectChange.emit(value);
  }

  protected _filterTargetObjects(filterValue: string): string[] {
    filterValue = filterValue.toLowerCase();
    return this.targetObjects.filter((targetObject) =>
      targetObject.toLowerCase().includes(filterValue)
    );
  }
}
