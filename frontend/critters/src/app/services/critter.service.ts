import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {CritterGetResponse} from '../shared/model/CritterGetResponse';
import {AuthService} from './auth.service';
import {WebSocketService} from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class CritterService {
  private baseUrl = 'http://localhost:8080/critter'; //Connect to spring boot

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private websocketService: WebSocketService
  ) {
    // Manage websocket connection based on auth
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.websocketService.connect();
      } else {
        this.websocketService.disconnect();
      }
    });
  }

  // HTTP: Fetch all critters
  getAllCritters(): Observable<CritterGetResponse[]> {
    return this.http.get<CritterGetResponse[]>(`${this.baseUrl}/all`, {
      withCredentials: true
    });
  }

  // Fetch critter by id
  getCritterById(id: number): Observable<CritterGetResponse> {
    return this.http.get<CritterGetResponse>(`${this.baseUrl}/${id}`,{
      withCredentials: true
    });
  }

  // WebSocket: Subscribe to critter by id
  subscribeToCritter(critterId: number): Observable<CritterGetResponse> {
    return this.websocketService.subscribeToCritter(critterId);
  }

  /* GAME MECHANICS
  * MAKE NEW critter
  * DELETE critter
  * ACTIVATE critter to start playing
  * DEACTIVATE critter to stop playing
  * TRAIN critter (pass training value to pet/how much the pet has been trained)
  * RESPOND to call
  * FEED the critter
  * HEAL the critter
  * */

  //Make new critter
  makeNewCritter(critterName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/new`, {critterName}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }

  //delete critter
  deleteCritter(critterId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${critterId}`,{
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }

  //Activation
  activateCritter(critterId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${critterId}/start`, {}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }

  //Deactivation
  deactivateCritter(critterId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${critterId}/stop`, {}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }

  //train critter
  trainCritter(critterId: number, trainingValue: number) {
    return this.http.patch(`${this.baseUrl}/${critterId}/train/${trainingValue}`,{}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }

  //respond to call
  respondToCall(critterId: number) {
    return this.http.patch(`${this.baseUrl}/${critterId}/respond`,{},{
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }

  //feed the critter
  feedCritter(critterId: number, foodName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${critterId}/feed/${foodName}`, {}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }

  //heal critter
  healCritter(critterId: number, medicineType: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${critterId}/heal/${medicineType}`, {}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    });
  }
}
