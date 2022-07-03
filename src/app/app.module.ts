import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { ProjectModule } from './project/project.module';
import { MaterialModule } from './material/material.module';
import { UserModule } from './user/user.module';
import { AppToolbarComponent } from './app-toolbar.component';
import { LoginViewComponent } from './views/login-view.component';
import { ProjectsViewComponent } from './views/projects-view.component';
import { AuthGuard } from './auth.guard';
import { GlobalErrorHandler } from './global-error-handler';
import { JiraProjectModule } from './jira-project/jira-project.module';
import { RequirementViewComponent } from './views/requirement-view.component';
import { DocumentViewComponent } from './views/document-view.component';
import { MeasureViewComponent } from './views/measure-view.component';
import { TaskViewComponent } from './views/task-view.component';
import { RequirementModule } from './requirement/requirement.module';
import { AppBreadcrumbTrailComponent } from './app-breadcrumb-trail.component';

const routes = [
  { 
    path: 'projects',
    canActivate: [AuthGuard],
    component: ProjectsViewComponent 
  },
  { 
    path: 'projects/:projectId/requirements', 
    canActivate: [AuthGuard],
    component: RequirementViewComponent 
  },
  {
    path: 'projects/:projectId/documents',
    canActivate: [AuthGuard],
    component: DocumentViewComponent
  },
  {
    path: 'requirements/:requirementId/measures',
    canActivate: [AuthGuard],
    component: MeasureViewComponent
  },
  {
    path: 'measures/:measureId/tasks',
    canActivate: [AuthGuard],
    component: MeasureViewComponent
  },
  { path: 'login', component: LoginViewComponent},
  { path: '**', redirectTo: 'projects' },
]

@NgModule({
  declarations: [
    AppComponent,
    AppToolbarComponent,
    LoginViewComponent,
    ProjectsViewComponent,
    RequirementViewComponent,
    DocumentViewComponent,
    MeasureViewComponent,
    TaskViewComponent,
    AppBreadcrumbTrailComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    MaterialModule,
    UserModule,
    JiraProjectModule,
    ProjectModule,
    RequirementModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
