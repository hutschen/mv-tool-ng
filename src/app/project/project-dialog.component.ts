import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IProjectInput } from '../shared/services/project.service';

@Component({
  selector: 'mvtool-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.css']
})
export class ProjectDialogComponent implements OnInit {
  projectInput: IProjectInput = {
    name: '',
  }

  constructor(protected _dialogRef: MatDialogRef<ProjectDialogComponent>) { }

  onSave(): void {
    this._dialogRef.close(this.projectInput);
  }
  onCancel(): void {
    this._dialogRef.close(null);
  }

  ngOnInit(): void {
  }

}
