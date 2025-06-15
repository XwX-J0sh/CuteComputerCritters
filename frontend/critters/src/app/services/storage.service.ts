import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

/**
 * Storage service manages user information (username, email, roles) in the browser's session storage
 * it'll be cleared when the user logs out
 */

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformID: Object) {
    this.isBrowser = isPlatformBrowser(platformID);
  }

  public getUser(): any {
    if(this.isBrowser) {
      const user = window.sessionStorage.getItem(USER_KEY);
      if (user) {
        return JSON.parse(user);
      }
    }
    return {};
  }

  public isLoggedIn(): boolean {
    if(this.isBrowser) {
      const user = window.sessionStorage.getItem(USER_KEY);
      if (user) {
        return true;
      }
    }
    return false;
  }
}
