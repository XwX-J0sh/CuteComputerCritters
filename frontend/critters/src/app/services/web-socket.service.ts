import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private subjects: { [key: string]: Subject<any> } = {};

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP: ' + str),
      onConnect: () => {
        console.log('WebSocket connected');
        // Resubscribe to all topics on reconnect
        Object.keys(this.subjects).forEach(topic => {
          this.internalSubscribe(topic);
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame.headers['message'], frame.body);
      }
    });

    this.stompClient.activate();
  }

  connect(): void {
    if (!this.stompClient.active) {
      this.stompClient.activate();
    }
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
  }

  subscribeToCritter(critterId: number): Observable<any> {
    const topic = `/topic/critter/${critterId}`;

    if (!this.subjects[topic]) {
      this.subjects[topic] = new Subject<any>();
      if (this.stompClient.connected) {
        this.internalSubscribe(topic);
      }
    }

    return this.subjects[topic].asObservable();
  }

  private internalSubscribe(topic: string): void {
    this.stompClient.subscribe(topic, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        this.subjects[topic].next(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  }
}
