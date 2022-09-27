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
    <div *ngIf="requirement" fxLayout="column">
      <mvtool-requirement-card
        [requirement]="requirement"
      ></mvtool-requirement-card>
      <mat-divider></mat-divider>
      <mvtool-measure-table [requirement]="requirement"> </mvtool-measure-table>
    </div>
    <div
      *ngIf="!requirement"
      fxLayout="column"
      style="height: 50%"
      fxLayoutAlign="center center"
    >
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles: [],
})
export class MeasureViewComponent implements OnInit {
  requirement: Requirement | null = null;

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _requirementService: RequirementService
  ) {}

  async ngOnInit(): Promise<void> {
    const requirementId = Number(
      this._route.snapshot.paramMap.get('requirementId')
    );
    try {
      this.requirement = await this._requirementService.getRequirement(
        requirementId
      );
    } catch (error: any) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this._router.navigate(['/']);
      } else {
        throw error;
      }
    }
  }
}
