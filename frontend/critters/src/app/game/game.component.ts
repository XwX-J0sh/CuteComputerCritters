import {Component, OnDestroy, OnInit, Inject, PLATFORM_ID} from '@angular/core';

import Phaser from 'phaser';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy{

  private game: any;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) return;

    const Phaser = (await import('phaser')).default;
    const { default: createGame } = await import('../../game/main');

    this.game = await createGame('game-container');
  }

  ngOnDestroy() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}
