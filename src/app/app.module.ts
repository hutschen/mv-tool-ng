import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { TruncatePipe } from './shared/pipes';

@NgModule({
  declarations: [
    AppComponent,
    ProjectTableComponent,
    TruncatePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
