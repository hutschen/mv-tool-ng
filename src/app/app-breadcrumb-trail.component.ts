import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Measure } from './shared/services/measure.service';
import { Project, ProjectService } from './shared/services/project.service';
import { Requirement, RequirementService } from './shared/services/requirement.service';
import { Task } from './shared/services/task.service';

interface IBreadcrumbTrailState {
  project: Project | null;
  requirement: Requirement | null;
  measure: Measure | null;
  task: Task | null;
  showDocuments: boolean;
  hide: boolean;
}

@Component({
  selector: 'mvtool-app-breadcrumb-trail',
  templateUrl: './app-breadcrumb-trail.component.html',
  styles: []
})
export class AppBreadcrumbTrailComponent implements OnInit {
  project: Project | null = null
  requirement: Requirement | null = null
  measure: Measure | null = null
  task: Task | null = null
  showDocuments: boolean = false
  hide: boolean = false

  constructor(
    protected _router: Router,
    protected _projectService: ProjectService,
    protected _requirementService: RequirementService) {}

  ngOnInit(): void {
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = this._router.url.split('/').filter(s => s.length > 0);
        // console.log(url);
        this._handleUrl(url);
      }
     });
  }

  onSwitchToProjects(): void {
    this._router.navigate(['projects'])
  }

  onSwitchToProject(): void {
    if (this.project) {
      this._router.navigate([
        'projects', this.project.id, 
        this.showDocuments? 'documents' : 'requirements'])
    }
  }

  onSwitchToRequirements(): void {
    if (this.project) {
      this.showDocuments = false
      this._router.navigate(['projects', this.project.id, 'requirements'])
    }
  }

  onSwitchToDocuments(): void {
    if (this.project) {
      this.showDocuments = true
      this._router.navigate(['projects', this.project.id, 'documents'])
    }
  }

  onSwitchToRequirement(): void {
    if (this.requirement) {
      this._router.navigate(['requirements', this.requirement.id])
    }
  }

  protected async _handleUrl(url: string[]): Promise<void> {
    let newState: IBreadcrumbTrailState = {
      project: null,
      requirement: null,
      measure: null,
      task: null,
      showDocuments: false,
      hide: false
    }

    if (url.length >= 2) {
      const entitySegment = url[0]
      const idSegment = Number(url[1])
      switch (entitySegment) {
        case 'projects':
          newState.project = await this._projectService.getProject(idSegment)
          if (url.length >= 3) {
            const subEntitySegment = url[2]
            newState.showDocuments = subEntitySegment === 'documents'
          }
          break;
        case 'requirements':
          newState.requirement = await this._requirementService.getRequirement(idSegment)
          newState.project = newState.requirement.project
          break;
        case 'measures':
          break;
        case 'tasks':
          break;
        default:
          newState.hide = true
          break;
      }
    } else if (url.length === 1) {
      const entitySegment = url[0]
      newState.hide = entitySegment !== 'projects'
    } else {
      newState.hide = true
    }

    // Apply new state
    this.project = newState.project
    this.requirement = newState.requirement
    this.measure = newState.measure
    this.task = newState.task
    this.showDocuments = newState.showDocuments
    this.hide = newState.hide
  }
}
