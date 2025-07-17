import Phaser from 'phaser';
import {
  AnimationType,
  Critter,
  EVOLUTION_VARIANTS,
  EvolutionStage,
  FinalEvolutionVariant,
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
    sick_idle: { frames: 2, frameRate: 6 },
    turn_sick: { frames: 5, frameRate: 8 }
  },
  shisa: {
    idle: { frames: 2, frameRate: 4 },
    eat: { frames: 11, frameRate: 9 },
    sick_idle: { frames: 2, frameRate: 5 },
    turn_sick: { frames: 3, frameRate: 5 }
  },
  hachiware: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 4, frameRate: 8 },
    sick_idle: { frames: 3, frameRate: 5 },
    turn_sick: { frames: 4, frameRate: 6 }
  },
  momonga: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 5, frameRate: 8 },
    sick_idle: { frames: 3, frameRate: 5 },
    turn_sick: { frames: 5, frameRate: 7 }
  },
  usagi: {
    idle: { frames: 2, frameRate: 3 },
    eat: { frames: 4, frameRate: 8 },
    sick_idle: { frames: 2, frameRate: 5 },
    turn_sick: { frames: 4, frameRate: 6 }
  }
};

const DOUBLE_SCALE_TEXTURES = [
  'baby_eat',
  'chiikawa_idle',
  'usagi_idle',
  'hachiware_eat',
  'momonga_eat',
  'chiikawa_eat',
  'usagi_eat',
  'shisa_idle',
  'shisa_eat',
];

const NORMAL_SCALE_TEXTURES = [
  // All sick idle textures
  'baby_sick_idle',
  'chiikawa_sick_idle',
  'hachiware_sick_idle',
  'momonga_sick_idle',
  'shisa_sick_idle',
  'usagi_sick_idle',

  'baby_turn_sick',
  'chiikawa_turn_sick',
  'hachiware_turn_sick',
  'momonga_turn_sick',
  'shisa_turn_sick',
  'usagi_turn_sick'
];

export class AnimationLoader {
  private scene: Phaser.Scene;
  private critterSprite: Phaser.GameObjects.Sprite;
  private currentVariant: FinalEvolutionVariant;
  private isPlayingSpecialAnimation: boolean = false;
  private currentAnimation: string = '';
  private critter: Critter;
  private animationsCreated = false;
  private static instanceCount = 0;
  private animationLock = false;


  constructor(scene: Phaser.Scene, critter: Critter) {
    if (!scene.anims) {
      throw new Error('Animation system not available in this scene');
    }
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
    const baseScale = 1.5;

    // Fallback to debug texture if main texture is missing
    if (!this.scene.textures.exists(spriteKey)) {
      console.error(`Main texture ${spriteKey} not found, using debug texture`);
      const debugSprite = this.scene.add.sprite(360, 400, '__MISSING')
        .setScale(1)
        .setTint(0xff0000);

      // Create debug graphics
      const g = this.scene.add.graphics();
      g.fillStyle(0xff0000, 0.5);
      g.fillRect(-50, -50, 100, 100);
      debugSprite.setInteractive(new Phaser.Geom.Rectangle(-50, -50, 100, 100),
        Phaser.Geom.Rectangle.Contains);

      return debugSprite;
    }

    const sprite = this.scene.add.sprite(360, 400, spriteKey)
      .setScale(this.getSpriteScale(spriteKey, baseScale))
      .setData('critter', critter)
      .setVisible(true)
      .setDepth(1000);

    console.log(`Sprite created with texture ${sprite.texture.key}`);
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
      case 'eat': return 'eat';
      case 'sick_idle': return 'sick_idle';
      case 'turn_sick': return 'turn_sick';
      default: return 'idle';
    }
  }

  private setupAnimations(): void {
    const stage = this.critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;

    if (stage === EvolutionStage.BABY) {
      this.createAnimation('idle');
      this.createAnimation('eat');
      this.createAnimation('sick_idle');
      this.createAnimation('turn_sick');
    } else {
      // Create animations for the current variant
      this.createAnimation('idle', this.currentVariant);
      this.createAnimation('eat', this.currentVariant);
      this.createAnimation('sick_idle', this.currentVariant);
      this.createAnimation('turn_sick', this.currentVariant);
    }

    this.animationsCreated = true;
  }

  private createAnimation(animationType: AnimationType, variant?: FinalEvolutionVariant): void {
    const isBaby = !variant;
    const spriteKey = isBaby
      ? `baby_${this.getAnimationFileName(animationType)}`
      : `${variant}_${this.getAnimationFileName(animationType)}`;

    console.log(`Creating animation from texture: ${spriteKey}`);

    if (!this.scene.textures.exists(spriteKey)) {
      console.error(`Texture ${spriteKey} not found! Available textures:`,
        this.scene.textures.getTextureKeys());
      return;
    }

    const texture = this.scene.textures.get(spriteKey);
    const frameConfig = isBaby
      ? ANIMATION_CONFIG.baby[animationType]
      : ANIMATION_CONFIG[variant][animationType];

    // Calculate safe frame count
    const availableFrames = texture.frameTotal;
    const requestedFrames = frameConfig.frames;
    const framesToUse = Math.min(availableFrames, requestedFrames);

    console.log(`Frame info - Available: ${availableFrames}, Requested: ${requestedFrames}, Using: ${framesToUse}`);

    const frames = this.scene.anims.generateFrameNumbers(spriteKey, {
      start: 0,
      end: framesToUse - 1
    });

    const animKey = this.getAnimationKey(
      isBaby ? EvolutionStage.BABY : EvolutionStage.FINAL,
      animationType
    );

    this.scene.anims.create({
      key: animKey,
      frames: frames,
      frameRate: frameConfig.frameRate,
      repeat: animationType === 'idle' || animationType === 'sick_idle' ? -1 : 0
    });

    console.log(`Created animation ${animKey} with ${frames.length} frames`);
  }

  private getAnimationKey(stage: EvolutionStage, animationType: AnimationType): string {
    const baseKey = stage === EvolutionStage.BABY ? 'baby' : this.currentVariant;

    // Simple consistent mapping
    return `${baseKey}_${animationType}_anim`;
  }

  public updateCritterData(critter: Critter): void {
    const previousVariant = this.currentVariant;
    const previousStage = this.critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;
    this.currentVariant = this.getVariant(critter);
    this.critter = critter;
    this.critterSprite.setData('critter', critter);

    const currentStage = critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;

    // Handle evolution stage changes
    if (previousStage !== currentStage || previousVariant !== this.currentVariant) {
      this.handleEvolutionTransition(previousStage, currentStage);
    }

    // Handle health state changes
    if (!critter.isHealthy) {
      if (this.currentAnimation !== 'sick_idle' && this.currentAnimation !== 'turn_sick') {
        this.playSickTransition();
      }
    } else if (this.currentAnimation === 'sick_idle' || this.currentAnimation === 'turn_sick') {
      this.playIdleAnimation();
    }
  }

  private handleEvolutionTransition(oldStage: EvolutionStage, newStage: EvolutionStage): void {
    // Create a smooth transition effect
    this.scene.tweens.add({
      targets: this.critterSprite,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        // Load new texture
        const textureKey = this.getSpriteKey(newStage, 'idle');
        if (this.scene.textures.exists(textureKey)) {
          this.critterSprite.setTexture(textureKey);
          this.critterSprite.setScale(this.getSpriteScale(textureKey, 1.5));

          // Recreate animations for the new form
          this.setupAnimations();

          // Fade back in
          this.scene.tweens.add({
            targets: this.critterSprite,
            alpha: 1,
            duration: 200
          });

          // Play appropriate animation
          if (this.critter.isHealthy) {
            this.playIdleAnimation();
          } else {
            this.playSickIdleAnimation();
          }
        }
      }
    });
  }

  public async playFeedingSequence(food: string): Promise<void> {
    try {
      // Unlock if currently locked (e.g., by sick state)
      const wasLocked = this.animationLock;
      this.setAnimationLock(false);

      // Play eat animation
      await this.playEatAnimation();

      // Return to appropriate state
      if (this.critter.isHealthy) {
        await this.playIdleAnimation();
      } else {
        await this.playSickIdleAnimation();
      }

      // Restore lock state if needed
      if (wasLocked) {
        this.setAnimationLock(true);
      }
    } catch (error) {
      console.error('Feeding sequence failed:', error);
      // Fallback to idle state
      this.playIdleAnimation();
    }
  }

  private getSpriteScale(textureKey: string, baseScale: number): number {
    // Debug logging
    console.log(`Scaling check for: ${textureKey}`);

    // Exact match for normal scale textures
    if (NORMAL_SCALE_TEXTURES.includes(textureKey)) {
      console.log(`Normal scale applied to: ${textureKey}`);
      return baseScale;
    }

    // Exact match for double scale textures
    if (DOUBLE_SCALE_TEXTURES.includes(textureKey)) {
      console.log(`Double scale applied to: ${textureKey}`);
      return baseScale * 2;
    }

    // Default scale with warning
    console.warn(`Texture ${textureKey} not in scaling lists, using base scale`);
    return baseScale;
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
    if (this.animationLock) {
      console.log('Animation locked - preventing idle switch');
      return;
    }

    const critter = this.critterSprite.getData('critter') as Critter;
    const stage = critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;
    const animKey = this.getAnimationKey(stage, 'idle');

    if (!this.scene.anims.exists(animKey)) {
      console.error(`Animation ${animKey} does not exist!`);
      return;
    }

    this.currentAnimation = 'idle';
    this.critterSprite.play(animKey);
  }

  public playSickIdleAnimation(): void {
    if (!this.scene?.anims) return;

    const critter = this.critterSprite.getData('critter') as Critter;
    const stage = critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;
    const animKey = this.getAnimationKey(stage, 'sick_idle');

    if (!this.scene.anims.exists(animKey)) {
      console.error(`Animation ${animKey} does not exist!`);
      return;
    }

    // Force restart even if already playing
    this.currentAnimation = 'sick_idle';
    this.critterSprite.play(animKey);
    this.setAnimationLock(true); // Lock to sick state

    // Periodic state verification
    this.critterSprite.on('animationupdate', () => {
      if (this.currentAnimation === 'sick_idle' && this.critterSprite.anims.currentAnim?.key !== animKey) {
        console.warn('Animation mismatch detected - correcting');
        this.critterSprite.play(animKey);
      }
    });
  }

  public async playEatAnimation(): Promise<void> {
    // First check if we should even attempt to play eat animation
    if (this.isPlayingSpecialAnimation || this.animationLock) {
      console.warn('Cannot play eat animation - special animation in progress or locked');
      return;
    }

    // Temporarily unlock if we're in sick state
    const wasLocked = this.animationLock;
    if (wasLocked) {
      this.setAnimationLock(false);
    }

    try {
      await this.playSpecialAnimation('eat');
    } catch (error) {
      console.error('Failed to play eat animation:', error);
    } finally {
      // Restore lock state if we were in sick state
      if (wasLocked) {
        this.setAnimationLock(true);
        this.playSickIdleAnimation();
      } else {
        this.playIdleAnimation();
      }
    }
  }

  public setAnimationLock(locked: boolean): void {
    this.animationLock = locked;
    console.log(`Animation lock ${locked ? 'enabled' : 'disabled'}`);
  }

  public getCurrentAnimation(): string {
    return this.currentAnimation;
  }

  public isAnimationLocked(): boolean {
    return this.animationLock;
  }

  private async playSickTransition(): Promise<void> {
    const originalScale = this.critterSprite.scale;
    const textureKey = this.getSpriteKey(
      this.critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL,
      'turn_sick'
    );

    // Force normal scale for sick animations
    this.critterSprite.setScale(this.getSpriteScale(textureKey, 1.5));

    await this.playSpecialAnimation('turn_sick');
    this.playSickIdleAnimation();

    // Ensure scale stays normal after transition
    const sickIdleKey = this.getSpriteKey(
      this.critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL,
      'sick_idle'
    );
    this.critterSprite.setScale(this.getSpriteScale(sickIdleKey, 1.5));
  }

  private async playSpecialAnimation(type: 'eat' | 'turn_sick'): Promise<void> {
    if (this.isPlayingSpecialAnimation) return;
    this.isPlayingSpecialAnimation = true;

    const critter = this.critterSprite.getData('critter') as Critter;
    const stage = critter.evolution < 2 ? EvolutionStage.BABY : EvolutionStage.FINAL;
    const animKey = this.getAnimationKey(stage, type); // <-- This was missing

    // Store the ORIGINAL scale before any animation changes
    const originalScale = this.critterSprite.scale;
    const wasIdle = this.currentAnimation.includes('idle');

    return new Promise(resolve => {
      this.currentAnimation = type;

      // Get animation-specific scale
      const animTextureKey = this.getSpriteKey(stage, type);
      const animScale = this.getSpriteScale(animTextureKey, 1.5);
      this.critterSprite.setScale(animScale).play(animKey);

      this.critterSprite.once('animationcomplete', () => {
        // Return to the ORIGINAL scale, not calculate a new one
        this.critterSprite.setScale(originalScale);

        // Play appropriate idle animation
        const targetAnim = critter.isHealthy ? 'idle' : 'sick_idle';
        const targetAnimKey = this.getAnimationKey(stage, targetAnim);
        this.critterSprite.play(targetAnimKey);

        this.currentAnimation = targetAnim;
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

  public debugTextureScales() {
    console.group('Texture Scale Debug');
    DOUBLE_SCALE_TEXTURES.forEach(textureKey => {
      const exists = this.scene.textures.exists(textureKey);
      console.log(`Texture ${textureKey}:`, {
        exists,
        inWhitelist: DOUBLE_SCALE_TEXTURES.includes(textureKey),
        wouldScale: this.getSpriteScale(textureKey, 1) > 1
      });
    });
    console.groupEnd();
  }
}
