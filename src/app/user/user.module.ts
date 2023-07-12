// Copyright (C) 2022 Helmar Hutschenreuter
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { UserMenuComponent } from './user-menu.component';
import { UserLoginComponent } from './user-login.component';
import { UserLoginViewComponent } from './user-login-view.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes = [{ path: 'login', component: UserLoginViewComponent }];

@NgModule({
  declarations: [UserMenuComponent, UserLoginComponent, UserLoginViewComponent],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ],
  exports: [UserMenuComponent],
})
export class UserModule {}
