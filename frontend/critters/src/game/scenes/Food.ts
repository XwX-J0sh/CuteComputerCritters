import {Scene} from 'phaser';

export class FoodPantry extends Scene{
  bg!: Phaser.GameObjects.Image;

  constructor() {
    super('FoodPantry');
  }

  create() {
    const { width, height} = this.scale;

    // Add background first
    this.bg = this.add.image(0, 0, 'background').setOrigin(0,0);
    this.bg.setDisplaySize(width, height);


  }
}
