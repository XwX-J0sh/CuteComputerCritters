import { Scene } from 'phaser';
import {EventBusService} from '../../app/services/event-bus.service';

export class Preloader extends Scene {
  eventBus!: EventBusService;

  constructor() {
    super('Preloader');
  }

  init(data: { eventBus: EventBusService}) {
    this.eventBus = data.eventBus;
  }


  preload() {
    this.add.image(512, 384, 'background');
    this.load.bitmapFont('DepartureMono', 'DepartureMono-Regular.png', 'DepartureMono-Regular.xml');
  }

  create() {
    this.scene.start('MainMenu', { eventBus: this.eventBus });
  }
}
