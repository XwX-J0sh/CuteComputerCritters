import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  logo!: GameObjects.Image;

  constructor() {
    super('MainMenu');
  }

  create() {
    this.add.image(512, 384, 'background');
    this.logo = this.add.image(512, 300, 'logo');
    this.add.text(512, 450, 'Click to Start', {
      font: '32px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}
