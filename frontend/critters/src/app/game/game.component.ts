import {Component, OnDestroy, OnInit, Inject, PLATFORM_ID} from '@angular/core';

import {isPlatformBrowser} from '@angular/common';
import {EventBusService} from '../services/event-bus.service';
import {CritterService} from '../services/critter.service';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy{

  private game: any;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object,
              private eventBus: EventBusService,
              private critterService: CritterService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) return;

    const Phaser = (await import('phaser')).default;
    const { default: createGame } = await import('../../game/main');

    this.game = createGame('game-container', this.eventBus);

    // Load critters when game initializes
    this.loadCritters();

    this.game.events.once('ready', () => {
      this.game.scene.start('Boot');
    });
  }

  private loadCritters() {
    this.critterService.getAllCritters().subscribe({
      next: (critters) => {
        // Emit the loaded critters to the event bus
        this.eventBus.emitCritters(critters);
      },
      error: (err) => {
        console.error('Error loading critters:', err);
        // Optionally emit empty array on error
        this.eventBus.emitCritters([]);
      }
    });

    this.game.events.once('ready', () => {
      this.game.scene.start('Boot');
    });

    // Handle critter creation
    this.eventBus.createCritter.subscribe(name => {
      this.critterService.makeNewCritter(name).subscribe({
        next: (response) => {
          console.log('Critter created:', response);
          // Reload critters to get the new one
          this.loadCritters();
        },
        error: (err) => {
          console.error('Error creating critter:', err);
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}
