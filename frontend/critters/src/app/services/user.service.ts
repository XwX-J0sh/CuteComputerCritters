import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../shared/model/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = 'http://localhost:8080/';

  constructor(private http: HttpClient) { }

  //gets the User Information (returns it in the format defined in the model User Info)
  //@QwQ Please do NOT give out the User ID (duh)
  getUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/user`, {
      withCredentials: true
    });
  }

}
