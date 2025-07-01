import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    this.add.image(512, 384, 'background');
    this.load.image('logo', '../assets/logo.png');
    this.load.image('star', '../assets/star.png');
  }

  create() {
    this.scene.start('MainMenu');
  }
}
