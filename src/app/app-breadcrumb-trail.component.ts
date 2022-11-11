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

import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Measure, MeasureService } from './shared/services/measure.service';
import { Project, ProjectService } from './shared/services/project.service';
import {
  Requirement,
  RequirementService,
} from './shared/services/requirement.service';

interface IBreadcrumbTrailState {
  project: Project | null;
  requirement: Requirement | null;
  showDocuments: boolean;
  hide: boolean;
}

@Component({
  selector: 'mvtool-app-breadcrumb-trail',
  templateUrl: './app-breadcrumb-trail.component.html',
  styles: [],
})
export class AppBreadcrumbTrailComponent implements OnInit {
  project: Project | null = null;
  requirement: Requirement | null = null;
  showDocuments: boolean = false;
  hide: boolean = false;

  constructor(
    protected _router: Router,
    protected _projectService: ProjectService,
    protected _requirementService: RequirementService,
    protected _measureService: MeasureService
  ) {}

  ngOnInit(): void {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = this._router.url.split('/').filter((s) => s.length > 0);
        // console.log(url);
        this._handleUrl(url);
      }
    });
  }

  onSwitchToProjects(): void {
    this._router.navigate(['projects']);
  }

  onSwitchToProject(): void {
    if (this.project) {
      this._router.navigate([
        'projects',
        this.project.id,
        this.showDocuments ? 'documents' : 'requirements',
      ]);
    }
  }

  onSwitchToRequirements(): void {
    if (this.project) {
      this.showDocuments = false;
      this._router.navigate(['projects', this.project.id, 'requirements']);
    }
  }

  onSwitchToDocuments(): void {
    if (this.project) {
      this.showDocuments = true;
      this._router.navigate(['projects', this.project.id, 'documents']);
    }
  }

  onSwitchToRequirement(): void {
    if (this.requirement) {
      this._router.navigate(['requirements', this.requirement.id, 'measures']);
    }
  }

  protected async _handleUrl(url: string[]): Promise<void> {
    let newState: IBreadcrumbTrailState = {
      project: null,
      requirement: null,
      showDocuments: false,
      hide: false,
    };

    if (url.length >= 2) {
      const entitySegment = url[0];
      const idSegment = Number(url[1]);
      switch (entitySegment) {
        case 'projects':
          newState.project = await this._projectService.getProject(idSegment);
          if (url.length >= 3) {
            const subEntitySegment = url[2];
            newState.showDocuments = subEntitySegment === 'documents';
          }
          break;
        case 'requirements':
          newState.requirement = await this._requirementService.getRequirement(
            idSegment
          );
          newState.project = newState.requirement.project;
          break;
        default:
          newState.hide = true;
          break;
      }
    } else if (url.length === 1) {
      const entitySegment = url[0];
      newState.hide = entitySegment !== 'projects';
    } else {
      newState.hide = true;
    }

    // Apply new state
    this.project = newState.project;
    this.requirement = newState.requirement;
    this.showDocuments = newState.showDocuments;
    this.hide = newState.hide;
  }
}