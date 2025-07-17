import { Scene, GameObjects } from 'phaser';
import {EventBusService} from '../../app/services/event-bus.service';

export class PetMenu extends Scene {
  logo!: GameObjects.Image;

  constructor(private eventBus: EventBusService) {
    super('PetMenu');
  }

  create() {
    this.logo = this.add.image(575, 130, 'logo')
    this.logo.setScale(1);
    this.add.text(250, 400, 'Choose CRITTER', {
      font: '30px Press Start 2 P',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });

    // Listen for Enter and Escape keys
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.start('Game');
    });

  }
}
