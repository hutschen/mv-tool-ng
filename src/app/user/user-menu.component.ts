import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { IUser, UserService } from '../shared/services/user.service';

@Component({
  selector: 'mvtool-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit {
  protected _user: UserService;
  protected _auth: AuthService;
  @Output() loggedOut: EventEmitter<void>;
  displayName: string = ''

  constructor(user: UserService, auth: AuthService) { 
    this._user = user;
    this._auth = auth;
    this.loggedOut = auth.loggedOut;
  }

  get isLoggedIn(): boolean {
    return this._auth.isLoggedIn;
  }

  protected async _onLoggedIn() {
    const user: IUser = await this._user.getUser();
    this.displayName = user.display_name;
  }

  onLogOut(): void {
    this._auth.logOut();
    this.displayName = '';
  }

  async ngOnInit() {
    if (this.isLoggedIn) {
      await this._onLoggedIn();
    }
    this._auth.loggedIn.subscribe(() => this._onLoggedIn());
  }
}
