import Phaser from 'phaser';
import {Critter, EVOLUTION_SPRITES, EvolutionStage} from './constants';

export class AnimationManager {
  private scene: Phaser.Scene;
  private critterSprite: Phaser.GameObjects.Sprite;
  private currentAnimation: string = 'idle';
  private isPlayingSpecialAnimation: boolean = false;

  constructor(scene: Phaser.Scene, critter: Critter) {
    this.scene = scene;
    this.critterSprite = this.createCritterSprite(critter);
    this.setupAnimations(critter);
    this.playIdleAnimation();
  }

  private createCritterSprite(critter: Critter): Phaser.GameObjects.Sprite {
    const stage = critter.evolutionStage || this.determineEvolutionStage(critter.evolution);
    const spriteKey = EVOLUTION_SPRITES[stage].idle;

    // Position might need adjustment based on your game layout
    const sprite = this.scene.add.sprite(550, 500, spriteKey);
    sprite.setScale(2);
    return sprite;
  }

  private determineEvolutionStage(evolution: number): EvolutionStage {
    // Adjust these thresholds based on your game's evolution logic
    return evolution < 5 ? EvolutionStage.BABY : EvolutionStage.FINAL;
  }

  private setupAnimations(critter: Critter) {
    const stage = critter.evolutionStage || this.determineEvolutionStage(critter.evolution);
    const sprites = EVOLUTION_SPRITES[stage];

    // Idle animation
    if (!this.scene.anims.exists(`${sprites.idle}_anim`)) {
      this.scene.anims.create({
        key: `${sprites.idle}_anim`,
        frames: this.scene.anims.generateFrameNumbers(sprites.idle, { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
      });
    }

    // Eat animation
    if (!this.scene.anims.exists(`${sprites.eat}_anim`)) {
      this.scene.anims.create({
        key: `${sprites.eat}_anim`,
        frames: this.scene.anims.generateFrameNumbers(sprites.eat, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: 0
      });
    }

    // Sick animation (assuming same sprite sheet for simplicity)
    if (!this.scene.anims.exists(`${sprites.idle}_sick`)) {
      this.scene.anims.create({
        key: `${sprites.idle}_sick`,
        frames: this.scene.anims.generateFrameNumbers(sprites.idle, { frames: [2, 3] }),
        frameRate: 3,
        repeat: -1
      });
    }
  }

  public playIdleAnimation(): void {
    if (this.isPlayingSpecialAnimation) return;

    const stage = this.determineEvolutionStage(this.critterSprite.data.get('evolution'));
    const sprites = EVOLUTION_SPRITES[stage];

    if (this.critterSprite.data.get('isHealthy') === false) {
      this.currentAnimation = 'sick';
      this.critterSprite.play(`${sprites.idle}_sick`);
    } else {
      this.currentAnimation = 'idle';
      this.critterSprite.play(`${sprites.idle}_anim`);
    }
  }

  public playEatAnimation(): Promise<void> {
    return new Promise((resolve) => {
      this.isPlayingSpecialAnimation = true;
      const stage = this.determineEvolutionStage(this.critterSprite.data.get('evolution'));
      const sprites = EVOLUTION_SPRITES[stage];

      this.critterSprite.play(`${sprites.eat}_anim`);

      this.critterSprite.once('animationcomplete', () => {
        this.isPlayingSpecialAnimation = false;
        this.playIdleAnimation();
        resolve();
      });
    });
  }

  public playCallAnimation(): Promise<void> {
    return new Promise((resolve) => {
      this.isPlayingSpecialAnimation = true;

      // Create a temporary animation that bobs up and down
      this.scene.tweens.add({
        targets: this.critterSprite,
        y: this.critterSprite.y - 20,
        duration: 200,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.isPlayingSpecialAnimation = false;
          this.playIdleAnimation();
          resolve();
        }
      });
    });
  }

  public updateCritterData(critter: Critter): void {
    this.critterSprite.setData('evolution', critter.evolution);
    this.critterSprite.setData('isHealthy', critter.isHealthy);

    // Only update animation if not playing a special animation
    if (!this.isPlayingSpecialAnimation) {
      this.playIdleAnimation();
    }
  }

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.critterSprite;
  }

  public destroy(): void {
    this.critterSprite.destroy();
  }
}
