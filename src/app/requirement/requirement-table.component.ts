import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../shared/services/project.service';
import { Requirement, RequirementService } from '../shared/services/requirement.service';
import { ComplianceDialogComponent } from './compliance-dialog.component';
import { RequirementDialogComponent } from './requirement-dialog.component';

@Component({
  selector: 'mvtool-requirement-table',
  templateUrl: './requirement-table.component.html',
  styles: []
})
export class RequirementTableComponent implements OnInit {
  displayedColumns: string[] = [
    'reference', 'summary', 'description', 'target_object', 'compliance_status',
    'compliance_comment', 'options'];
  data: Requirement[] = []
  dataLoaded: boolean = false
  @Input() project: Project | null = null;
  @Output() requirementClicked = new EventEmitter<Requirement>()

  constructor(
    protected _requirementService: RequirementService,
    protected _route: ActivatedRoute,
    protected _dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
    await this.onReloadRequirements()
    this.dataLoaded = true
  }

  onCreateRequirement(): void {
    let dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: { projectId: this.project?.id, requirement: null }
    })
    dialogRef.afterClosed().subscribe(async requirementInput => {
      if (requirementInput && this.project) {
        await this._requirementService.createRequirement(
          this.project.id, requirementInput)
        this.onReloadRequirements()
      }
    })
  }
  onEditRequirement(requirement: Requirement): void {
    let dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: { projectId: this.project?.id, requirement: requirement }
    })
    dialogRef.afterClosed().subscribe(async requirementInput => {
      if (requirementInput) {
        await this._requirementService.updateRequirement(
          requirement.id, requirementInput)
        this.onReloadRequirements()
      }
    })
  }

  onEditCompliance(requirement: Requirement): void {
    let dialogRef = this._dialog.open(ComplianceDialogComponent, {
      width: '500px',
      data: requirement
    })
    dialogRef.afterClosed().subscribe(async requirementInput => {
      if (requirementInput) {
        await this._requirementService.updateRequirement(
          requirement.id, requirementInput)
        this.onReloadRequirements()
      }
    })
  }

  async onDeleteRequirement(requirement: Requirement): Promise<void> {
    await this._requirementService.deleteRequirement(requirement.id)
    this.onReloadRequirements()
  }

  onExportRequirements() { }
  onImportRequirements() { }

  async onReloadRequirements() {
    if (this.project) {
      this.data = await this._requirementService.listRequirements(
        this.project.id)
    }
  }
}
