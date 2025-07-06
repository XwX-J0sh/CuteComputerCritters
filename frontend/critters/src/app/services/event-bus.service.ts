import { Injectable, EventEmitter } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CritterService} from './critter.service';
import {Critter} from '../../game/scenes/helpers/constants';

interface ActivationStatus {
  critterId: number;
  isActive: boolean;
  timestamp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService {

  constructor(private critterService: CritterService) {
  }

  feed = new EventEmitter<void>();
  play = new EventEmitter<void>();
  sleep = new EventEmitter<void>();
  critterActivated = new EventEmitter<number>();
  currentSceneReady = new EventEmitter<Phaser.Scene>();

  //LOAD CRITTERS (multiple)
  private crittersSubject = new BehaviorSubject<Critter[]>([]);
  critters$ = this.crittersSubject.asObservable();

  //LOAD critter (singular)
  private critterSubject = new BehaviorSubject<any>(null);
  critter$ = this.critterSubject.asObservable();

  //CREATE NEW CRITTER
  createCritter = new EventEmitter<string>();
  // New emitter for creating critters
  critterCreated = new EventEmitter<any>();

  // Emit entire critters array
  emitCritters(critters: any[]) {
    this.crittersSubject.next(critters);
  }

  // Emit single critter by ID
  emitCritterById(id: string) {
    const currentCritters = this.crittersSubject.value;
    const critter = currentCritters.find(c => c.critterId === id);
    if (critter) {
      this.critterSubject.next(critter);
    } else {
      console.warn(`Critter with ID ${id} not found`);
    }
  }

  // Emit newly created critter
  emitCritterCreated(newCritter: any) {
    // Add to current critters array
    const updatedCritters = [...this.crittersSubject.value, newCritter];
    this.crittersSubject.next(updatedCritters);

    // Emit creation event
    this.critterCreated.emit(newCritter);

    // Also emit as single critter
    this.critterSubject.next(newCritter);
  }

  // activate critter
  async activateCritter(critterId: number): Promise<boolean> {
    try {
      await this.critterService.activateCritter(critterId).toPromise();
      return true;
    } catch (error) {
      console.error('Database activation failed:', error);
      return false;
    }
  }

  //deactivate critter
  async deactivateCritter(critterId: number): Promise<boolean> {
    try {
      await this.critterService.deactivateCritter(critterId).toPromise();
      return true; // Success
    } catch (error) {
      console.error('Database deactivation failed:', error);
      return false; // Failure
    }
  }
}
