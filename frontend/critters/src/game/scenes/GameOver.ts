import { Scene } from 'phaser';
import {EventBusService} from '../../app/services/event-bus.service';

export class GameOver extends Scene {

  eventBus!: EventBusService;
  constructor() {
    super('GameOver');
  }

  init(data: { eventBus: EventBusService }) {
    this.eventBus = data.eventBus;
  }


  create() {
    this.add.image(512, 384, 'background');

    this.add.text(512, 384, 'Game Over', {
      font: '48px Arial',
      color: '#ff0000',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu', { eventBus: this.eventBus });
    });
  }
}
