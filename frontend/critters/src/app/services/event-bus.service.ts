import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  feed = new EventEmitter<void>();
  play = new EventEmitter<void>();
  sleep = new EventEmitter<void>();
  currentSceneReady = new EventEmitter<Phaser.Scene>();
}
