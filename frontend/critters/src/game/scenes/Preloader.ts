import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    this.add.image(512, 384, 'background');
    this.load.bitmapFont('DepartureMono', 'DepartureMono-Regular.png', 'DepartureMono-Regular.xml');
  }

  create() {
    this.scene.start('MainMenu');
  }
}
