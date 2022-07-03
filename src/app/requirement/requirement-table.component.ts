import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Requirement, RequirementService } from '../shared/services/requirement.service';

@Component({
  selector: 'mvtool-requirement-table',
  templateUrl: './requirement-table.component.html',
  styleUrls: ['./requirement-table.component.css']
})
export class RequirementTableComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'options'];
  dataSource = new MatTableDataSource<Requirement>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;
  @Output() requirementSelected = new EventEmitter<Requirement>()

  constructor(
    protected _requirementService: RequirementService, 
    protected _dialog: MatDialog) {}

  async ngOnInit() {
    // TODO: get project id from route
    const projectId = 1
    this.dataSource.data = await this._requirementService.listRequirements(projectId)
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  onCreateRequirement() {}
  onEditRequirement(requirement: Requirement): void {}
  async onDeleteRequirement(requirement: Requirement): Promise<void> {}
  onFilterRequirements(event: Event) {}
  onExportRequirements() {}
  onImportRequirements() {}
}
