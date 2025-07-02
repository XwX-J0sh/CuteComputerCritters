import { Scene } from 'phaser';
import {EventBusService} from '../../app/services/event-bus.service';

export class Boot extends Scene {
  eventBus!: EventBusService;
  constructor ()
  {
    super('Boot');
  }

  init(data: { eventBus: EventBusService }) {
    this.eventBus = data.eventBus;
    console.log('Boot scene eventBus:', this.eventBus);
  }

  preload ()
  {
    this.load.image('background', 'assets/bg.png');
    this.load.image('logo', 'assets/logo.png')
  }

  create ()
  {
    this.scene.start('Preloader', { eventBus: this.eventBus });
  }
}
