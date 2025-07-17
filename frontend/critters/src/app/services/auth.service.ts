import { Injectable } from '@angular/core';
import { environment} from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, map, Observable, of, tap} from 'rxjs';
import { User } from '../shared/model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = 'http://localhost:8080';

  private FAKE_MODE = environment.production;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  public readonly isLoggedIn$ = this.currentUser$.pipe(
    map(user => !!user)
  );

  constructor(private http: HttpClient) {}

  checkAuth(): Observable<User> {
    if (this.FAKE_MODE) {
      const fakeUser: User = {
        id: 1,
        username: 'devuser',
        email: 'dev@example.com',
        roles: ['USER']
      };
      this.currentUserSubject.next(fakeUser);
      return of(fakeUser);
    }

    return this.http.get<User>(`${this.API_URL}/user`, { withCredentials: true }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  login(username: string, password: string): Observable<User> {
    if (this.FAKE_MODE) {
      const fakeUser: User = {
        id: 1,
        username,
        email: `${username}@mock.local`,
        roles: ['USER']
      };
      this.currentUserSubject.next(fakeUser);
      return of(fakeUser);
    }

    return this.http.post<User>(
      `${this.API_URL}/auth/signin`,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout(): Observable<any> {
    if (this.FAKE_MODE) {
      this.currentUserSubject.next(null);
      return of(true);
    }

    return this.http.post(`${this.API_URL}/auth/signout`, {}, { withCredentials: true }).pipe(
      tap(() => this.currentUserSubject.next(null))
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    if (this.FAKE_MODE) {
      console.log(`Fake register: ${username}, ${email}`);
      return of({ success: true, message: 'Fake registration successful' });
    }

    return this.http.post(`${this.API_URL}/auth/signup`, {
      username,
      email,
      password
    });
  }
}
