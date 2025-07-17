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
    this.load.image('background', '../assets/game-elements/bg.PNG');
    this.load.image('logo', '../assets/logo.png');
    this.load.image('buttonBg', '../assets/game-elements/button_normal.PNG');
    this.load.image('buttonPressedBg', '../assets/game-elements/button_clicked.PNG');
    this.load.image('home', '../assets/home.PNG');
  }

  create ()
  {
    this.scene.start('Preloader', { eventBus: this.eventBus });
  }
}
