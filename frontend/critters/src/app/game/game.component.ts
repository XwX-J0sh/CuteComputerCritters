import {Component, OnDestroy, OnInit, Inject, PLATFORM_ID, NgZone} from '@angular/core';

import {isPlatformBrowser} from '@angular/common';
import {EventBusService} from '../services/event-bus.service';
import {CritterService} from '../services/critter.service';

@Component({
  selector: 'app-game',
  imports: [],
  template: `<div id="game-container"></div>`,
  standalone: true
})
export class GameComponent implements OnInit, OnDestroy{

  private game: any;
  isBrowser: boolean;
  private gameInitialized = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object,
              private ngZone: NgZone,
              private eventBus: EventBusService,
              private critterService: CritterService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) return;

    try {
      await this.ngZone.runOutsideAngular(async () => {
        const Phaser = await import('phaser');
        const { default: createGame } = await import('../../game/main');

        this.game = createGame('game-container', this.eventBus);
        this.gameInitialized = true;

        // Wait for game to be fully ready
        await new Promise<void>(resolve => {
          this.game!.events.once('ready', resolve);
        });

        // Load critters when game initializes
        this.loadCritters();

        this.game.scene.start('Boot');
      });
    } catch (error) {
      console.error('Game initialization failed:', error);
    }
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

    /*
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
    });*/
  }

  ngOnDestroy() {
    if (this.gameInitialized && this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}
