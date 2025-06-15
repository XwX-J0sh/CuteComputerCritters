import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, map, Observable, tap} from 'rxjs';
import {User} from '../shared/model/user';

/**
 * Service:
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = 'http://localhost:8080/api';

  // Holds current user info or null if logged out
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Observable for components to subscribe to auth state changes
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  //readonly isLoggedIn observable which checks whether the user is logged in or not
  public readonly isLoggedIn$ = this.currentUser$.pipe(
    map(user => !!user)
  );

  // Call this on app init or page reload to check if user is logged in
  checkAuth(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/user`, { withCredentials: true }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(
      `${this.API_URL}/auth/signin`,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/signout`, {}, { withCredentials: true }).pipe(
      tap(() => this.currentUserSubject.next(null))
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/signup`, {
      username,
      email,
      password
    });
  }
}
