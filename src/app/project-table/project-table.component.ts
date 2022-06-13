import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mvtool-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.css']
})
export class ProjectTableComponent implements OnInit {
  projects: any[] = [
    {
      "description": "Some description of the test project.",
      "jira_project_id": null,
      "id": 1,
      "name": "A test project"
    },
    {
      "description": "Some description of the test project.",
      "jira_project_id": null,
      "id": 2,
      "name": "A test project"
    },
    {
      "description": "Some description of the test project.",
      "jira_project_id": null,
      "id": 3,
      "name": "A test project"
    },
    {
      "description": "Some description of the test project.",
      "jira_project_id": null,
      "id": 4,
      "name": "A test project"
    },
    {
      "description": "Some description of the test project.",
      "jira_project_id": null,
      "id": 5,
      "name": "A test project"
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
