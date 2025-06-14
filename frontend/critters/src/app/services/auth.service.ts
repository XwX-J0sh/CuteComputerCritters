import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {parseJwt} from '../shared/jwt-utils';

/**
 * Service: Sends registration, login, logout HTTP POST Requests to backend
 * - LOGIN (sends username and password with a POST Request)
 * -REGISTER (sends username, email and password with POST)
 * LOGOUT (logs out using POST Req)
 */

const AUTH_API = 'http://localhost:8080/api/auth/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //in memory storage for the accessToken and currentUser
  private accessToken: string | null = null;
  private currentUser: any = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(
      AUTH_API + 'signin',
      { username, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), withCredentials: true }
    ).pipe(
      tap(response => {
        this.accessToken = response.accessToken;
        this.currentUser = parseJwt(response.accessToken);
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      { username, email, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  logout(): Observable<any> {
    this.accessToken = null;
    this.currentUser = null;
    return this.http.post(AUTH_API + 'signout', {}, { withCredentials: true });
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(
      AUTH_API + 'refreshtoken',
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.accessToken = response.accessToken;
        this.currentUser = parseJwt(response.accessToken);
      })
    );
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getCurrentUser(): any {
    return this.currentUser;
  }
}
