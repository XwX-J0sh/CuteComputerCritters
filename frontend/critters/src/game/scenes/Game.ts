import { Scene } from 'phaser';

export class Game extends Scene {
  pet!: Phaser.GameObjects.Sprite;
  bg!: Phaser.GameObjects.Image;

  constructor() {
    super('Game');
  }

  preload() {
    this.load.spritesheet('pet', '../assets/shisa_idle1.png', {
      frameWidth: 148,  // width of a single frame
      frameHeight: 128, // height of a single frame
    });
  }

  create() {
    const { width, height} = this.scale;

    // Add background first
    this.bg = this.add.image(0, 0, 'background').setOrigin(0,0);
    this.bg.setDisplaySize(width, height);

    // Define the idle animation
    this.anims.create({
      key: 'shisa_idle1',
      frames: this.anims.generateFrameNumbers('pet', {
        start: 0,
        end: 1, // Assuming 4 frames (0–3)
      }),
      frameRate: 2,
      repeat: -1, // loop forever
    });

    // Create the avatar sprite and play the idle animation
    this.pet = this.add.sprite(570, 550, 'pet');
    this.pet.play('shisa_idle1');

    this.add.text(512, 384, 'Tamagotchi Game', {
      font: '32px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Check keyboard plugin before attaching listener
    const keyboard = this.input.keyboard;
    if (keyboard) {
      keyboard.on('keydown-ESC', () => {
        console.log('Escape pressed. Going back to MainMenu.');
        this.scene.start('MainMenu');
      });
    } else {
      console.warn('Keyboard input not ready!');
    }
  }
}
