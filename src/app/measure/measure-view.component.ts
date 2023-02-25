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

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-measure-view',
  template: `
    <div *ngIf="requirement" class="fx-column">
      <mvtool-requirement-details
        [requirement]="requirement"
      ></mvtool-requirement-details>
      <mat-divider></mat-divider>
      <mvtool-http-measure-table
        [requirement]="requirement"
      ></mvtool-http-measure-table>
    </div>
    <div
      *ngIf="!requirement"
      class="fx-column fx-center-center"
      style="height: 50%"
    >
      <mat-spinner></mat-spinner>
    </div>
  `,
  styleUrls: ['../shared/styles/flex.scss'],
  styles: [],
})
export class MeasureViewComponent implements OnInit {
  requirement!: Requirement;

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _requirementService: RequirementService
  ) {}

  ngOnInit(): void {
    const requirementId = Number(
      this._route.snapshot.paramMap.get('requirementId')
    );
    this._requirementService.getRequirement(requirementId).subscribe({
      next: (requirement) => {
        this.requirement = requirement;
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this._router.navigate(['/']);
        } else {
          throw error;
        }
      },
    });
  }
}
