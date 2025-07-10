// animation-loader.ts
import Phaser from 'phaser';
import {
  AnimationType,
  Critter,
  EVOLUTION_SPRITES,
  EVOLUTION_VARIANTS,
  EvolutionStage,
  FinalEvolutionVariant
} from './constants';

// Frame configuration for each animation type and variant
const ANIMATION_CONFIG = {
  baby: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 4, frameRate: 8 },
    sick_idle: { frames: 3, frameRate: 5 },
    turn_sick: { frames: 4, frameRate: 6 }
  },
  chiikawa: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 6, frameRate: 10 },
    sick_idle: { frames: 4, frameRate: 6 },
    turn_sick: { frames: 5, frameRate: 8 }
  },
  shisa: {
    idle: { frames: 3, frameRate: 4 },
    eat: { frames: 5, frameRate: 12 },
    sick_idle: { frames: 4, frameRate: 5 },
    turn_sick: { frames: 6, frameRate: 7 }
  },
  hachiware: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 4, frameRate: 8 },
    sick_idle: { frames: 3, frameRate: 5 },
    turn_sick: { frames: 4, frameRate: 6 }
  },
  momonga: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 5, frameRate: 10 },
    sick_idle: { frames: 3, frameRate: 5 },
    turn_sick: { frames: 5, frameRate: 7 }
  },
  usagi: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 4, frameRate: 8 },
    sick_idle: { frames: 3, frameRate: 5 },
    turn_sick: { frames: 4, frameRate: 6 }
  }
};

export class AnimationLoader {
  private scene: Phaser.Scene;
  private critterSprite: Phaser.GameObjects.Sprite;
  private currentVariant: FinalEvolutionVariant;
  private isPlayingSpecialAnimation: boolean = false;
  private currentAnimation: string = '';

  constructor(scene: Phaser.Scene, critter: Critter) {
    this.scene = scene;
    this.currentVariant = this.getVariant(critter);
    this.critterSprite = this.createSprite(critter);
    this.setupAnimations();
    this.updateCritterData(critter);
  }

  private getVariant(critter: Critter): FinalEvolutionVariant {
    return EVOLUTION_VARIANTS[critter.evolution] || 'chiikawa';
  }

  private createSprite(critter: Critter): Phaser.GameObjects.Sprite {
    const stage = critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;
    const spriteKey = this.getSpriteKey(stage, 'idle');

    const sprite = this.scene.add.sprite(600, 400, spriteKey);
    sprite.setScale(stage === EvolutionStage.BABY ? 1.5 : 2);
    sprite.setData('critter', critter);
    return sprite;
  }

  private getSpriteKey(stage: EvolutionStage, animationType: AnimationType): string {
    if (stage === EvolutionStage.BABY) {
      return `baby_${this.getAnimationFileName(animationType)}`;
    }
    return `${this.currentVariant}_${this.getAnimationFileName(animationType)}`;
  }

  private getAnimationFileName(animationType: AnimationType): string {
    switch(animationType) {
      case 'idle': return 'idle';
      case 'eat': return 'eating';
      case 'sick_idle': return 'sick_idle';
      case 'turn_sick': return 'turn_sick';
      default: return 'idle1';
    }
  }

  private setupAnimations(): void {
    this.createAnimation('idle');
    this.createAnimation('eat');
    this.createAnimation('sick_idle');
    this.createAnimation('turn_sick');
  }

  private createAnimation(animationType: AnimationType): void {
    const critter = this.critterSprite.getData('critter') as Critter;
    const stage = critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;
    const spriteKey = this.getSpriteKey(stage, animationType);
    const animKey = this.getAnimationKey(stage, animationType);

    const variant = stage === EvolutionStage.BABY ? 'baby' : this.currentVariant;
    const frameConfig = ANIMATION_CONFIG[variant][animationType];

    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, {
          start: 0,
          end: frameConfig.frames - 1
        }),
        frameRate: frameConfig.frameRate,
        repeat: animationType === 'idle' || animationType === 'sick_idle' ? -1 : 0
      });
    }
  }

  private getAnimationKey(stage: EvolutionStage, animationType: AnimationType): string {
    if (stage === EvolutionStage.BABY) {
      return `baby_${animationType}_anim`;
    }
    return `${this.currentVariant}_${animationType}_anim`;
  }

  public updateCritterData(critter: Critter): void {
    const previousVariant = this.currentVariant;
    this.currentVariant = this.getVariant(critter);
    this.critterSprite.setData('critter', critter);

    if (previousVariant !== this.currentVariant && !this.isPlayingSpecialAnimation) {
      this.setupAnimations();
      this.playAppropriateIdleAnimation();
    }

    // Handle automatic animation transitions based on critter state
    if (!critter.isHealthy && this.currentAnimation !== 'sick_idle') {
      if (this.currentAnimation !== 'turn_sick') {
        this.playSickTransition();
      }
    } else if (critter.isHealthy &&
      (this.currentAnimation === 'sick_idle' || this.currentAnimation === 'turn_sick')) {
      this.playIdleAnimation();
    }
  }

  private playAppropriateIdleAnimation() {
    const critter = this.critterSprite.getData('critter') as Critter;
    if (!critter.isHealthy) {
      this.playSickIdleAnimation();
    } else {
      this.playIdleAnimation();
    }
  }

  public playIdleAnimation(): void {
    if (this.currentAnimation === 'idle') return;

    const critter = this.critterSprite.getData('critter') as Critter;
    const animKey = this.getAnimationKey(
      critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL,
      'idle'
    );

    this.currentAnimation = 'idle';
    this.critterSprite.play(animKey);
  }

  private playSickIdleAnimation(): void {
    if (this.currentAnimation === 'sick_idle') return;

    const critter = this.critterSprite.getData('critter') as Critter;
    const animKey = this.getAnimationKey(
      critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL,
      'sick_idle'
    );

    this.currentAnimation = 'sick_idle';
    this.critterSprite.play(animKey);
  }

  public async playEatAnimation(): Promise<void> {
    await this.playSpecialAnimation('eat');
  }

  private async playSickTransition(): Promise<void> {
    await this.playSpecialAnimation('turn_sick');
    this.playSickIdleAnimation();
  }

  private async playSpecialAnimation(type: 'eat' | 'turn_sick'): Promise<void> {
    if (this.isPlayingSpecialAnimation) return;
    this.isPlayingSpecialAnimation = true;

    const critter = this.critterSprite.getData('critter') as Critter;
    const animKey = this.getAnimationKey(
      critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL,
      type
    );

    return new Promise(resolve => {
      this.currentAnimation = type;
      this.critterSprite.play(animKey);

      this.critterSprite.once('animationcomplete', () => {
        this.isPlayingSpecialAnimation = false;
        resolve();
      });
    });
  }

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.critterSprite;
  }

  public destroy(): void {
    this.critterSprite.destroy();
  }
}
