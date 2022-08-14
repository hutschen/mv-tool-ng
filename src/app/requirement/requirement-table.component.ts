import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  DownloadDialogComponent,
  IDownloadDialogData,
} from '../shared/components/download-dialog.component';
import { ITableColumn } from '../shared/components/table.component';
import { UploadDialogComponent } from '../shared/components/upload-dialog.component';
import { Project } from '../shared/services/project.service';
import {
  Requirement,
  RequirementService,
} from '../shared/services/requirement.service';
import { ComplianceDialogComponent } from './compliance-dialog.component';
import {
  IRequirementDialogData,
  RequirementDialogComponent,
} from './requirement-dialog.component';

@Component({
  selector: 'mvtool-requirement-table',
  templateUrl: './requirement-table.component.html',
  styles: [],
})
export class RequirementTableComponent implements OnInit {
  columns: ITableColumn[] = [
    { name: 'reference', optional: true },
    { name: 'summary', optional: false },
    { name: 'description', optional: true },
    { name: 'target_object', optional: true },
    { name: 'compliance_status', optional: false },
    { name: 'compliance_comment', optional: true },
    { name: 'completion', optional: false },
    { name: 'options', optional: false },
  ];
  data: Requirement[] = [];
  dataLoaded: boolean = false;
  @Input() project: Project | null = null;
  @Output() requirementClicked = new EventEmitter<Requirement>();

  constructor(
    protected _requirementService: RequirementService,
    protected _route: ActivatedRoute,
    protected _dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await this.onReloadRequirements();
    this.dataLoaded = true;
  }

  onCreateRequirement(): void {
    let dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: {
        project: this.project,
        requirement: null,
      } as IRequirementDialogData,
    });
    dialogRef.afterClosed().subscribe(async (requirementInput) => {
      if (requirementInput && this.project) {
        await this._requirementService.createRequirement(
          this.project.id,
          requirementInput
        );
        this.onReloadRequirements();
      }
    });
  }
  onEditRequirement(requirement: Requirement): void {
    let dialogRef = this._dialog.open(RequirementDialogComponent, {
      width: '500px',
      data: {
        project: this.project,
        requirement: requirement,
      } as IRequirementDialogData,
    });
    dialogRef.afterClosed().subscribe(async (requirementInput) => {
      if (requirementInput) {
        await this._requirementService.updateRequirement(
          requirement.id,
          requirementInput
        );
        this.onReloadRequirements();
      }
    });
  }

  onEditCompliance(requirement: Requirement): void {
    let dialogRef = this._dialog.open(ComplianceDialogComponent, {
      width: '500px',
      data: requirement,
    });
    dialogRef.afterClosed().subscribe(async (requirementInput) => {
      if (requirementInput) {
        await this._requirementService.updateRequirement(
          requirement.id,
          requirementInput
        );
        this.onReloadRequirements();
      }
    });
  }

  async onDeleteRequirement(requirement: Requirement): Promise<void> {
    await this._requirementService.deleteRequirement(requirement.id);
    this.onReloadRequirements();
  }

  onExportRequirements() {
    if (this.project) {
      this._dialog.open(DownloadDialogComponent, {
        width: '500px',
        data: {
          download$: this._requirementService.downloadRequirementsExcel(
            this.project.id
          ),
          filename: 'requirements.xlsx',
        } as IDownloadDialogData,
      });
    }
  }

  onImportRequirements() {
    if (this.project) {
      const projectId = this.project.id;
      const dialogRef = this._dialog.open(UploadDialogComponent, {
        width: '500px',
        data: (file: File) => {
          return this._requirementService.uploadRequirementsExcel(
            projectId,
            file
          );
        },
      });
      dialogRef.afterClosed().subscribe(() => {
        this.onReloadRequirements();
      });
    }
  }

  async onReloadRequirements() {
    if (this.project) {
      this.data = await this._requirementService.listRequirements(
        this.project.id
      );
    }
  }
}
