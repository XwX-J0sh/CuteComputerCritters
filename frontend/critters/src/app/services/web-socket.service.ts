import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Client, IMessage} from '@stomp/stompjs';

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
      reconnectDelay: 500,
      heartbeatIncoming: 400,
      heartbeatOutgoing: 400,
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.connected = true;

        //auto-subscribe to all previously requested topics on connect:
        for (const topic in this.subjects) {
          console.log('[WS] Subscribing to:', topic);
          this.subscribeToTopic(topic);
        }
      },
      onStompError: (frame) => {
        console.error('Broker error', frame.headers['message']);
        console.error('Details:', frame.body);
      }
    });

    this.stompClient.activate();
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
      console.log('[WS] Creating subject for:', topic);
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
      console.log('[WS] subscribing to topic:', topic);

    });
  }
}
