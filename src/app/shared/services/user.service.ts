import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';

export interface IUser {
  display_name: string
  email_address: string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(protected _crud: CRUDService<IUser, IUser>) {}

  getUserUrl() : string {
    return 'jira-user'
  }

  async getUser(): Promise<IUser> {
    return this._crud.read(this.getUserUrl())
  }
}
