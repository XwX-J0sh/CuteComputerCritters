import { Scene } from 'phaser';

export class Game extends Scene {
  pet!: Phaser.GameObjects.Sprite;
  avatar!: Phaser.GameObjects.Sprite;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('pet', '../assets/pet.png');
    this.load.image('pet', '../assets/avatar.png');
  }

  create() {
    this.pet = this.add.sprite(400, 300, 'pet');
    this.avatar = this.add.sprite(400, 300, 'avatar');

    this.add.image(512, 384, 'background');

    this.add.text(512, 384, 'Tamagotchi Game', {
      font: '32px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameOver');
    });
  }
}
