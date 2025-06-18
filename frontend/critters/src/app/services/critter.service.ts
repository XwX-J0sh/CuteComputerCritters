import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {filter, Observable, Subject} from 'rxjs';
import {CritterGetResponse} from '../shared/model/CritterGetResponse';
import {AuthService} from './auth.service';
import {Client, IMessage} from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class CritterService {
  private baseUrl = 'http://localhost:8080/critter'; //Connect to spring boot

  private stompClient!: Client;
  private connected = false;

  private subjects: { [key: string]: Subject<any> } = {};

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Only connect WebSocket after successful login
    //and disconnect when logged out
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.connectWebSocket();
      } else if (this.connected) {
        this.disconnect();
      }
    });
  }

  // HTTP: Fetch all critters
  getAllCritters(): Observable<CritterGetResponse[]> {
    return this.http.get<CritterGetResponse[]>(`${this.baseUrl}/all`, {
      withCredentials: true
    });
  }

  // WebSocket: Subscribe to critter by id
  subscribeToCritter(critterId: number): Observable<any> {
    const topic = `/topic/critter/${critterId}`;

    if (!this.subjects[topic]) {
      const subject = new Subject<any>();
      this.subjects[topic] = subject;

      if (this.connected) {
        this.subscribeToTopic(topic);
      }
    }

    return this.subjects[topic].asObservable();
  }

  /* GAME MECHANICS
  * MAKE NEW critter
  * ACTIVATE critter to start playing
  * DEACTIVATE critter to stop playing
  * TRAIN critter
  * RESPOND to call
  * FEED the critter
  * HEAL the critter
  * */

  //Make new critter
  makeNewCritter(critterName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/new`, {critterName}, {
      withCredentials: true
    })
  }

  //Activation
  activateCritter(critterId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${critterId}/start`, {}, {
      withCredentials: true
    });
  }

  //Deactivation
  deactivateCritter(critterId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${critterId}/stop`, {}, {
      withCredentials: true
    });
  }

  //train critter
  trainCritter(critterId: number, trainingValue: number) {
    return this.http.patch(`${this.baseUrl}/${critterId}/train/${trainingValue}`,{}, {
      withCredentials: true
    });
  }

  //respond to call
  respondToCall(critterId: number) {
    return this.http.patch(`${this.baseUrl}/${critterId}/respond`,{},{
      withCredentials: true
    });
  }

  //feed the critter
  feedCritter(critterId: number, foodName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${critterId}/feed/${foodName}`, {}, {
      withCredentials: true
    });
  }

  //heal critter
  healCritter(critterId: number, medicineType: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${critterId}/heal/${medicineType}`, {}, {
      withCredentials: true
    });
  }

  private connectWebSocket(): void {
    if (this.connected) return;

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[CritterService] WebSocket connected');
        this.connected = true;

        // Subscribe to already-requested topics
        for (const topic in this.subjects) {
          this.subscribeToTopic(topic);
        }
      },
      onStompError: (frame) => {
        console.error('[CritterService] STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  private subscribeToTopic(topic: string): void {
    this.stompClient.subscribe(topic, (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.subjects[topic].next(data);
    });
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }
}
