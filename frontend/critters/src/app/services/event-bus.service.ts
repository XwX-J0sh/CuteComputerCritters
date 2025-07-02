import { Injectable, EventEmitter } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  feed = new EventEmitter<void>();
  play = new EventEmitter<void>();
  sleep = new EventEmitter<void>();
  currentSceneReady = new EventEmitter<Phaser.Scene>();

  //LOAD CRITTERS
  private crittersSubject = new BehaviorSubject<any[]>([]);
  critters$ = this.crittersSubject.asObservable();

  emitCritters(critters: any[]) {
    this.crittersSubject.next(critters);
  }

  //CREATE NEW CRITTER
  createCritter = new EventEmitter<string>();

  // New emitter for creating critters
  critterCreated = new EventEmitter<any>();

  emitCritterCreated(newCritter: any) {
    this.critterCreated.emit(newCritter);
  }
}
