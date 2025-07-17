import {Component, OnDestroy, OnInit, Inject, PLATFORM_ID} from '@angular/core';

import {isPlatformBrowser} from '@angular/common';
import {EventBusService} from '../services/event-bus.service';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy{

  private game: any;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private eventBus: EventBusService) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) return;

    const Phaser = (await import('phaser')).default;
    const { default: createGame } = await import('../../game/main');

    // Dynamically import Phaser and scenes here to avoid SSR errors
    const { Boot } = await import('../../game/scenes/Boot');
    const { Preloader } = await import('../../game/scenes/Preloader');
    const { MainMenu } = await import('../../game/scenes/MainMenu');
    const { PetMenu } = await import('../../game/scenes/PetMenu');
    const { Game } = await import('../../game/scenes/Game');
    const { GameOver } = await import('../../game/scenes/GameOver');

    // create scene instances and pass eventBus to scenes that need it
    const bootScene = new Boot();
    const preloaderScene = new Preloader();
    const mainMenuScene = new MainMenu();
    const petMenuScene = new PetMenu(this.eventBus);
    const gameScene = new Game();
    const gameOverScene = new GameOver();

    this.game = await createGame('game-container', [
      bootScene,
      preloaderScene,
      mainMenuScene,
      petMenuScene,
      gameScene,
      gameOverScene,
    ]);
  }

  ngOnDestroy() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}
