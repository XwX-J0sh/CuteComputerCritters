import { Scene } from 'phaser';

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    this.add.image(512, 384, 'background');

    this.add.text(512, 384, 'Game Over', {
      font: '48px Arial',
      color: '#ff0000',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu');
    });
  }
}
