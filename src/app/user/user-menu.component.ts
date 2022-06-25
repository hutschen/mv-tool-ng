import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { IUser, UserService } from '../shared/services/user.service';

@Component({
  selector: 'mvtool-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit {
  @Output() loggedOut: EventEmitter<void> = new EventEmitter<void>();
  @Output() logIn: EventEmitter<void> = new EventEmitter<void>();
  displayName: string = ''

  constructor(protected _user: UserService, protected _auth: AuthService) { }

  onLogIn(): void {
    this.logIn.emit();
  }

  onLogOut(): void {
    this._auth.logOut();
    this.loggedOut.emit();
  }

  get isLoggedIn(): boolean {
    return this._auth.isLoggedIn;
  }

  async ngOnInit(): Promise<void> {
    const user = await this._user.getUser();
    this.displayName = user.display_name
  }
}
