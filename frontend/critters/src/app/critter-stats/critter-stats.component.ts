import {Component, OnDestroy, OnInit} from '@angular/core';
import * as SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs'

@Component({
  selector: 'app-critter-stats',
  imports: [],
  templateUrl: './critter-stats.component.html',
  styleUrl: './critter-stats.component.scss'
})
export class CritterStatsComponent implements OnInit, OnDestroy {
  private stompClient: Client;
  public critterStats: any;

  ngOnInit(): void {
    this.connectWebSocket();
  }

  connectWebSocket(): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient.subscribe('/topic/critter-stats', (message: Message) => {
          this.critterStats = JSON.parse(message.body);
          console.log('Received critter stats:', this.critterStats);
        });
      },
      onStompError: (frame) => {
        console.error('Broker error: ', frame.headers['message']);
      }
    });

    this.stompClient.activate();
  }

  ngOnDestroy(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }
}
