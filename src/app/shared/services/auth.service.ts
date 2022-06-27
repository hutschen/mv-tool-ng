import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UnauthorizedError } from '../errors';

export interface ICredentials {
  username: string
  password: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  static STORAGE_KEY = 'credentials'
  stateChanged = new EventEmitter<void>()

  constructor() {}

  logIn(credentials: ICredentials, keepLoggedIn=false) {
    let storage: Storage = keepLoggedIn? localStorage : sessionStorage
    storage.setItem(AuthService.STORAGE_KEY, JSON.stringify(credentials))
    this.stateChanged.emit()
  }

  protected get _storage(): Storage {
    if(localStorage.getItem(AuthService.STORAGE_KEY)) {
      return localStorage
    } else {
      return sessionStorage
    }
  }

  get isLoggedIn(): boolean {
    return Boolean(this._storage.getItem(AuthService.STORAGE_KEY))
  }

  logOut() {
    if (this._storage.getItem(AuthService.STORAGE_KEY)) {
      this._storage.removeItem(AuthService.STORAGE_KEY)
    }
    this.stateChanged.emit()
  }

  public get credentials(): ICredentials {
    let credentials = this._storage.getItem(AuthService.STORAGE_KEY)
    if (credentials) {
      return <ICredentials> JSON.parse(credentials)
    } else {
      throw new UnauthorizedError('User is not logged in.')
    }
  }
}
