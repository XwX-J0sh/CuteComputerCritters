import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CritterGetResponse} from "../shared/model/CritterGetResponse";
import {CommonModule} from "@angular/common";
import {CritterService} from "../services/critter.service";
import {Subscription} from "rxjs";
import {FormsModule} from '@angular/forms';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-critter-stats',
  imports: [CommonModule, FormsModule],
  templateUrl: './critter-stats.component.html',
  styleUrls: ['./critter-stats.component.scss']
})
export class CritterStatsComponent implements OnInit, OnDestroy {
  critters: CritterGetResponse[] = [];
  private subscriptions: Subscription[] = [];
  showCreateForm = false;
  newCritterName = '';
  private loginSubscription?: Subscription

  constructor(private critterService: CritterService, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loginSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.loadCritters();
      } else {
        this.clearDataOnLogout();
      }
    });
  }

  clearDataOnLogout(): void {
    this.critters = [];
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCritters(): void {
    this.critterService.getAllCritters().subscribe({
      next: (critters) => {
        this.critters = critters;
        console.log('Loaded critters:', critters);

        // Clear old subscriptions
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];

        // Subscribe to each critter's real-time updates
        this.critters.forEach(critter => {
          const sub = this.critterService.subscribeToCritter(critter.critterId).subscribe(data => {
            const index = this.critters.findIndex(c => c.critterId === data.critterId);
            if (index !== -1) {
              this.critters[index] = { ...this.critters[index], ...data };
              console.log('Data critter:', data);
              this.cdr.detectChanges();
            }
          });
          this.subscriptions.push(sub);
        });

      },
      error: (err) => {
        console.error('Failed to load critters:', err);
      }
    });
  }

  //Create new critter
  createCritter(critterName: string): void {
    if(!this.newCritterName.trim()) {
      return;
    }

    this.critterService.makeNewCritter(critterName).subscribe({
      next: (response) => {
        console.log('New critter created:', response);
        this.loadCritters(); // Refresh the list
        this.showCreateForm = false; //Hide form after creation
        this.newCritterName = '';
      },
      error: (err) => console.error('Error creating critter:', err)
    });
  }

  //Activate
  activate(id: number): void {
    this.critterService.activateCritter(id).subscribe((updatedCritter) => {
      console.log(`Critter ${id} activated`);
    });
  }

  //Pause
  deactivate(id: number): void {
    this.critterService.deactivateCritter(id).subscribe((updatedCritter) => {
      console.log(`Critter ${id} deactivated`);
    })
  }

  //train critter
  train(id: number, trainingValue: number) {
    this.critterService.trainCritter(id, trainingValue).subscribe((updatedCritter) => {
      console.log(`Trainingvalue ${trainingValue}`);
    });
  }

  //respond to call
  respondCall(id: number) {
    this.critterService.respondToCall(id).subscribe(() => {
      console.log('Responded to call');
    });
  }

  //feed critter
  feed(id: number, foodName: string) {
    this.critterService.feedCritter(id, foodName).subscribe(() => {
      console.log(`Fed critter!`);
    });
  }

  //heal critter
  heal(id: number, medicineType: string) {
    this.critterService.healCritter(id, medicineType).subscribe(() => {
      console.log(`Healed critter!`);
    });
  }

  //delete critter
  delete(id: number) {
    this.critterService.deleteCritter(id).subscribe(() => {
      console.log('Deleted critter!');
      this.critters = this.critters.filter(c => c.critterId !== id);

      // Optionally, unsubscribe from its WebSocket if needed
      // (only if you’re tracking per-critter subscriptions individually)
    });
  }
}
