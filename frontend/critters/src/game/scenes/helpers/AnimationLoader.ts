import Phaser from 'phaser';
import { Critter, EVOLUTION_SPRITES, EvolutionStage, FinalEvolutionVariant, EVOLUTION_VARIANTS } from './constants';

export class AnimationLoader {
  private scene: Phaser.Scene;
  private critterSprite: Phaser.GameObjects.Sprite;
  private currentVariant: FinalEvolutionVariant;
  private isPlayingSpecialAnimation: boolean = false;

  constructor(scene: Phaser.Scene, critter: Critter) {
    this.scene = scene;
    this.currentVariant = this.getVariant(critter);
    this.critterSprite = this.createSprite(critter);
    this.setupAnimations();
    this.updateCritterData(critter); // Initialize with critter data
  }

  private getVariant(critter: Critter): FinalEvolutionVariant {
    return EVOLUTION_VARIANTS[critter.evolution] || 'chiikawa';
  }

  private createSprite(critter: Critter): Phaser.GameObjects.Sprite {
    const stage = critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;
    const spriteKey = stage === EvolutionStage.BABY
      ? EVOLUTION_SPRITES[stage].idle
      : `${this.currentVariant}_idle`;

    const sprite = this.scene.add.sprite(600, 400, spriteKey);
    sprite.setScale(2);
    sprite.setData('critter', critter); // Store critter reference
    return sprite;
  }

  private setupAnimations(): void {
    // Setup animations for current variant
    const idleKey = this.currentVariant === 'chiikawa' ? 'pet' : `${this.currentVariant}_idle`;

    if (!this.scene.anims.exists(`${idleKey}_anim`)) {
      this.scene.anims.create({
        key: `${idleKey}_anim`,
        frames: this.scene.anims.generateFrameNumbers(idleKey, { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
      });
    }
  }

  public updateCritterData(critter: Critter): void {
    // Update stored critter data
    this.critterSprite.setData('critter', critter);

    // Only update animation if not playing special animation
    if (!this.isPlayingSpecialAnimation) {
      this.playIdleAnimation();
    }
  }

  public playIdleAnimation(): void {
    const critter = this.critterSprite.getData('critter') as Critter;
    const animKey = critter.evolution < 2
      ? `${EVOLUTION_SPRITES[EvolutionStage.BABY].idle}_anim`
      : `${this.currentVariant}_idle_anim`;

    this.critterSprite.play(animKey);
  }

  public async playEatAnimation(): Promise<void> {
    if (this.isPlayingSpecialAnimation) return;
    this.isPlayingSpecialAnimation = true;

    const critter = this.critterSprite.getData('critter') as Critter;
    const animKey = critter.evolution < 2
      ? `${EVOLUTION_SPRITES[EvolutionStage.BABY].eat}_anim`
      : `${this.currentVariant}_eat_anim`;

    return new Promise(resolve => {
      this.critterSprite.play(animKey);
      this.critterSprite.once('animationcomplete', () => {
        this.isPlayingSpecialAnimation = false;
        this.playIdleAnimation();
        resolve();
      });
    });
  }

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.critterSprite;
  }
}
