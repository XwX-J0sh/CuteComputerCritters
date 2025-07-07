import { Injectable, EventEmitter } from '@angular/core';
import {BehaviorSubject, catchError, distinctUntilChanged, EMPTY, Subscription} from 'rxjs';
import {CritterService} from './critter.service';
import {Critter} from '../../game/scenes/helpers/constants';
import {CritterGetResponse} from '../shared/model/CritterGetResponse';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {

  constructor(public critterService: CritterService) {
    this.setupRealTimeUpdates();
  }

  feed = new EventEmitter<void>();
  play = new EventEmitter<void>();
  sleep = new EventEmitter<void>();
  critterActivated = new EventEmitter<number>();
  currentSceneReady = new EventEmitter<Phaser.Scene>();
  private activeCritterSubscription?: Subscription;
  private critterUpdateSubject = new BehaviorSubject<CritterGetResponse | null>(null);
  critterUpdate$ = this.critterUpdateSubject.asObservable();


  //LOAD CRITTERS (multiple)
  private crittersSubject = new BehaviorSubject<Critter[]>([]);
  critters$ = this.crittersSubject.asObservable();

  //LOAD critter (singular)
  private critterSubject = new BehaviorSubject<any>(null);
  critter$ = this.critterSubject.asObservable();

  //CREATE NEW CRITTER
  //createCritter = new EventEmitter<string>();
  // New emitter for creating critters
  critterCreated = new EventEmitter<any>();

  // Emit entire critters array
  emitCritters(critters: any[]) {
    this.crittersSubject.next(critters);
  }

  // Emit single critter by ID
  emitCritterById(id: number) {
    const currentCritters = this.crittersSubject.value;
    const critter = currentCritters.find(c => c.critterId === id);
    if (critter) {
      this.critterSubject.next(critter);
    } else {
      console.warn(`Critter with ID ${id} not found`);
    }
  }

  async createCritter(name: string): Promise<boolean> {
    try {
      const newCritter = await this.critterService.makeNewCritter(name).toPromise();
      if (newCritter) {
        this.emitCritterCreated(newCritter);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Critter creation failed:', error);
      return false;
    }
  }

  //emit UPDATES
  private setupRealTimeUpdates() {
    this.critter$.pipe(
      distinctUntilChanged((prev, curr) => prev?.critterId === curr?.critterId)
    ).subscribe(critter => {
      // Clean up previous subscription
      if (this.activeCritterSubscription) {
        this.activeCritterSubscription.unsubscribe();
      }

      if (critter?.critterId) {
        this.activeCritterSubscription = this.critterService.subscribeToCritter(critter.critterId).pipe(
          catchError(error => {
            console.error('WebSocket error:', error);
            return EMPTY;
          })
        ).subscribe(updatedCritter => {
          console.log('Real-time update received:', updatedCritter);

          // Update single critter
          this.critterSubject.next(updatedCritter);

          // Update critters array if needed
          const currentCritters = this.crittersSubject.value;
          const index = currentCritters.findIndex(c => c.critterId === updatedCritter.critterId);
          if (index >= -1) {
            const updatedCritters = [...currentCritters];
            updatedCritters[index] = updatedCritter;
            this.crittersSubject.next(updatedCritters);
          }

          // Emit through update stream
          this.critterUpdateSubject.next(updatedCritter);
        });
      }
    });
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

  //respond to Call
  async respondToCall(critterId: number): Promise<boolean> {
    try {
      await this.critterService.respondToCall(critterId).toPromise();
      return true; // Success
    } catch (error) {
      console.error('Response to call failed:', error);
      return false; // Failure
    }
  }

  //heal critter
  async healCritter(critterId: number, medicineType: string): Promise<boolean> {
    try {
      await this.critterService.healCritter(critterId, medicineType).toPromise();
      return true; // Success
    } catch (error) {
      console.error('Healing critter failed:', error);
      return false; // Failure
    }
  }

  //feed critter
  async feedCritter(critterId: number, foodName: string): Promise<boolean> {
    try {
      await this.critterService.feedCritter(critterId, foodName).toPromise();
      return true; // Success
    } catch (error) {
      console.error('Feeding critter failed:', error);
      return false; // Failure
    }
  }
}
