// animation-loader.ts
import Phaser from 'phaser';
import {
  AnimationType,
  Critter,
  EVOLUTION_SPRITES,
  EVOLUTION_VARIANTS,
  EvolutionStage,
  FinalEvolutionVariant, PhaserTextureFrame
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
  private critter: Critter;
  private animationsCreated = false;
  private static instanceCount = 0;

  constructor(scene: Phaser.Scene, critter: Critter) {
    AnimationLoader.instanceCount++;
    console.log(`AnimationLoader instance created (Total: ${AnimationLoader.instanceCount})`);
    this.scene = scene;
    this.critter = critter;
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

    const sprite = this.scene.add.sprite(600, 400, spriteKey)
      .setScale(stage === EvolutionStage.BABY ? 1.5 : 2)
      .setData('critter', critter)
      .setVisible(true)
      .setDepth(1000);

    // Proper debug output for sprite
    console.log('Sprite debug:', {
      x: sprite.x,
      y: sprite.y,
      visible: sprite.visible,
      frame: sprite.frame?.name || 'none',
      texture: sprite.texture?.key || 'none',
      inCameraView: this.scene.cameras.main.worldView.contains(sprite.x, sprite.y)
    });

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

    this.animationsCreated = true;
  }

  private createAnimation(animationType: AnimationType): void {
    const spriteKey = `baby_${this.getAnimationFileName(animationType)}`;
    const animKey = this.getAnimationKey(EvolutionStage.BABY, animationType);

    console.log(`Creating animation ${animKey} from texture ${spriteKey}`);

    if (!this.scene.textures.exists(spriteKey)) {
      console.error(`Texture not found: ${spriteKey}`);
      return;
    }

    const texture = this.scene.textures.get(spriteKey);
    const frameConfig = ANIMATION_CONFIG.baby[animationType];

    // Debug texture info
    console.log(`Creating ${animKey} from ${spriteKey}`, {
      textureSize: { width: texture.source[0].width, height: texture.source[0].height },
      frameTotal: texture.frameTotal,
      configFrames: frameConfig.frames
    });

    // Skip if animation exists
    if (this.scene.anims.exists(animKey)) {
      console.log(`Animation already exists: ${animKey}`);
      return;
    }

    // Safety check - don't exceed available frames
    const endFrame = Math.min(frameConfig.frames - 1, texture.frameTotal - 1);

    // Debug frame generation
    const frames = this.scene.anims.generateFrameNumbers(spriteKey, {
      start: 0,
      end: endFrame
    });
    console.log(`Generated frames for ${animKey}:`, frames);

    this.scene.anims.create({
      key: animKey,
      frames: frames,
      frameRate: frameConfig.frameRate,
      repeat: animationType === 'idle' || animationType === 'sick_idle' ? -1 : 0
    });

    console.log(`Created ${animKey} with frames 0-${endFrame}`);
  }

  private getAnimationKey(stage: EvolutionStage, animationType: AnimationType): string {
    const baseKey = stage === EvolutionStage.BABY ? 'baby' : this.currentVariant;

    // Map animation types to consistent keys
    const typeMap = {
      idle: 'idle',
      eat: 'eating',  // Changed from 'eat' to match texture naming
      sick_idle: 'sick_idle',
      turn_sick: 'turn_sick'
    };

    return `${baseKey}_${typeMap[animationType]}_anim`;
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
    const animKey = 'baby_idle_anim';

    // Debug animation existence
    if (!this.scene.anims.exists(animKey)) {
      console.error(`Animation ${animKey} does not exist!`);
      return;
    }

    // Debug before playing
    console.log('Playing animation with config:', {
      animKey,
      sprite: this.critterSprite.texture.key,
      currentFrame: this.critterSprite.frame
    });

    this.critterSprite.play(animKey);

    // Debug after playing
    this.critterSprite.once('animationstart', () => {
      console.log('Animation started:', {
        currentAnim: this.critterSprite.anims.currentAnim,
        currentFrame: this.critterSprite.frame
      });
    });
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
    AnimationLoader.instanceCount--;
    console.log(`AnimationLoader instance destroyed (Remaining: ${AnimationLoader.instanceCount})`);
    this.critterSprite.destroy();

    // Clean up all resources
    this.critterSprite?.destroy();
    this.critterSprite?.off('animationcomplete');
    this.critterSprite?.off('animationstart');

    // Remove all references
    this.scene = null as any;
    this.critter = null as any;
  }
}
