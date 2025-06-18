import {Component, OnDestroy, OnInit} from '@angular/core';
import {CritterGetResponse} from "../shared/model/CritterGetResponse";
import {CommonModule} from "@angular/common";
import {CritterService} from "../services/critter.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-critter-stats',
  imports: [CommonModule],
  templateUrl: './critter-stats.component.html',
  styleUrl: './critter-stats.component.scss'
})
export class CritterStatsComponent implements OnInit, OnDestroy {
  critters: CritterGetResponse[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private critterService: CritterService) {}

  ngOnInit(): void {
    this.loadCritters();

    // Example: Listen to real-time updates for critter ID 1
    const sub = this.critterService.subscribeToCritter(1).subscribe(data => {
      console.log('[WebSocket] Update for critter 1:', data);
      // You could update `this.critters` here based on `data`
    });

    this.subscriptions.push(sub);
  }

  loadCritters(): void {
    this.critterService.getAllCritters().subscribe({
      next: (critters) => {
        this.critters = critters;
        console.log('Loaded critters:', critters);
      },
      error: (err) => {
        console.error('Failed to load critters:', err);
      }
    });
  }

  //Create new critter
  createCritter(): void {
    this.critterService.makeNewCritter('Fluffy').subscribe({
      next: (response) => {
        console.log('New critter created:', response);
        this.loadCritters(); // Refresh the list
      },
      error: (err) => console.error('Error creating critter:', err)
    });
  }

  //Activate
  activate(id: number): void {
    this.critterService.activateCritter(id).subscribe(() => {
      console.log(`Critter ${id} activated`);
    });
  }

  //Pause
  deactivate(id: number): void {
    this.critterService.deactivateCritter(id).subscribe(() => {
      console.log(`Critter ${id} deactivated`);
    })
  }

  //train critter
  train(id: number, trainingValue: number) {
    this.critterService.trainCritter(id, trainingValue).subscribe(() => {
      console.log(`Trainingvalue ${trainingValue}`);
    })
  }

  //respond to call
  respondCall(id: number) {
    this.critterService.respondToCall(id).subscribe(() => {
      console.log('Responded to call');
    })
  }

  //feed critter
  feed(id: number, foodName: string) {
    this.critterService.feedCritter(id, foodName).subscribe(() => {
      console.log(`Fed critter!`);
    })
  }

  //heal critter
  heal(id: number, medicineType: string) {
    this.critterService.healCritter(id, medicineType).subscribe(() => {
      console.log(`Healed critter!`);
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
