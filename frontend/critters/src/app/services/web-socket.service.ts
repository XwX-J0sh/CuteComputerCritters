import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Client, IMessage, Message, Stomp} from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private connected: boolean = false;

  private subjects: { [key: string]: Subject<any> } = {};

  connect(): void {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000, // auto-reconnect in ms
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket');

        // Example subscription
        this.stompClient.subscribe('/topic/critter/1', (message: IMessage) => {
          console.log('Received message:', JSON.parse(message.body));
        });
      },
      onStompError: (frame) => {
        console.error('Broker error', frame.headers['message']);
        console.error('Details:', frame.body);
      }
    });

    this.stompClient.activate(); // THIS is how you connect
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }
  subscribeToCritter(critterId: number): Observable<any> {
    const topic = `/topic/critter/${critterId}`;

    if (!this.subjects[topic]) {
      const subject = new Subject<any>();
      this.subjects[topic] = subject;

      // Wait for active connection
      if (this.connected) {
        this.subscribeToTopic(topic);
      }
    }

    return this.subjects[topic].asObservable();
  }

  private subscribeToTopic(topic: string): void {
    this.stompClient.subscribe(topic, (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.subjects[topic].next(data);
    });
  }
}
