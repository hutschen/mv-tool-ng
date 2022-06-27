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

const routes = [
  { path: 'projects',
    canActivate: [AuthGuard],
    component: ProjectsViewComponent 
  },
  { path: 'login', component: LoginViewComponent},
  { path: '**', redirectTo: 'projects' },
]

@NgModule({
  declarations: [
    AppComponent,
    AppToolbarComponent,
    LoginViewComponent,
    ProjectsViewComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    UserModule,
    ProjectModule,
    MaterialModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
