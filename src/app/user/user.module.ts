import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { UserMenuComponent } from './user-menu.component';
import { UserLoginComponent } from './user-login.component';

@NgModule({
  declarations: [
    UserMenuComponent,
    UserLoginComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
  ]
})
export class UserModule { }
