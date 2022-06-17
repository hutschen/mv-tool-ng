import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

interface ICredentials {
  username: string
  password: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  static STORAGE_KEY = 'mvtool_credentials'

  constructor() { 
    if (!environment.production) {
      this.logIn(environment.username, environment.password)
    }
  }

  public logIn(username: string, password: string, keepLoggedIn=false) {
    let credentials: ICredentials = {
      username: username,
      password: password
    }
    let storage: Storage = keepLoggedIn? localStorage : sessionStorage
    storage.setItem(AuthService.STORAGE_KEY, JSON.stringify(credentials))
  }

  private get _storage(): Storage {
    if(localStorage.getItem(AuthService.STORAGE_KEY)) {
      return localStorage
    } else {
      return sessionStorage
    }
  }

  public logOut(username: string, password: string) {
    if (this._storage.getItem(AuthService.STORAGE_KEY)) {
      this._storage.removeItem(AuthService.STORAGE_KEY)
    }
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
