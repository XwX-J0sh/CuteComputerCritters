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
    this.add.image(0,0, 'background').setOrigin(0,0);

    this.add.text(512, 384, 'Your Pet has Died', {
      font: '48px Arial',
      color: '#ff0000',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('PetMenu', { eventBus: this.eventBus });
    });
  }
}
