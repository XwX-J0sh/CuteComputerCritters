import { Scene, GameObjects } from 'phaser';
import {EventBusService} from '../../app/services/event-bus.service';
import {Subscription} from 'rxjs';
import {CritterGetResponse} from '../../app/shared/model/CritterGetResponse';

export class MainMenu extends Scene {
  logo!: GameObjects.Image;
  bg!: GameObjects.Image;
  eventBus!: EventBusService;

  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;

    this.logo = this.add.image(575, 350, 'logo')
    this.logo.setScale(1);
    this.add.text(512, 450, 'Click to Start', {
      font: '30px Press Start 2 P', //32px Arial
      color: '#ffffff',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('PetMenu');
    });

    // Listen for Enter and Escape keys
    this.input.keyboard?.on('keydown-ENTER', () => {
      // when creating Phaser game or starting scene, pass eventBusService
      this.scene.start('PetMenu');
    });
  }
}
