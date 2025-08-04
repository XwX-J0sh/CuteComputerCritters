import { BaseGame } from './BaseGame';

export class Game extends BaseGame {
  private returningFromFeeding = false;
  private selectedFood: string | null = null;
  private wasFoodSelected = false;
  private wasSickBeforeTransition = false; // NEW: Track sick state

  constructor() {
    super({ key: 'Game' });
  }

  override init(data: { selectedCritter: any; food?: string; wasSick?: boolean }) {
    super.init(data);
    this.selectedCritter = data.selectedCritter;

    //Prioritize current health state, fallback to passed wasSick
    this.wasSickBeforeTransition = data.wasSick ?? !this.selectedCritter?.isHealthy;

    if (data.food) {
      this.selectedFood = data.food;
      this.returningFromFeeding = true;
      this.wasFoodSelected = true;
    } else {
      this.wasFoodSelected = false;
    }
  }

  override async create(): Promise<void> {
    console.log('[Game] create called');

    await super.create();

    try {
      this.add.image(346, 405, 'home');

      if (!this.critter || !this.animationManager) {
        throw new Error('Critter or animation manager not ready');
      }

      // Health state synchronization
      this.syncCritterHealthState();

      // Handle feeding animation if returning from FoodPantry
      if (this.handleFeedingReturn()) {
        return;
      }

      // Initial animation setup
      this.setupInitialAnimation();

      // Delayed state verification
      this.setupStateVerification();
    } catch (error) {
      console.error('Game create failed:', error);
      this.scene.start('PetMenu');
    }
  }

  private syncCritterHealthState(): void {
    const shouldBeSick = !this.critter.isHealthy;
    this.wasSickBeforeTransition = shouldBeSick;
  }

  private handleFeedingReturn(): boolean {
    if (this.returningFromFeeding && this.selectedFood && this.animationManager) {
      console.log('Playing feed animation for', this.selectedFood);
      this.animationManager.playFeedingSequence(this.selectedFood)
        .catch(error => console.error('Feeding sequence failed:', error))
        .finally(() => this.resetFeedingState());
      this.eventBus.feedCritter(this.critter.critterId, this.selectedFood);
      return true;
    }
    return false;
  }

  private setupInitialAnimation(): void {
    if (this.wasSickBeforeTransition) {
      console.log('Forcing sick idle animation');
      this.animationManager!.playSickIdleAnimation();
    } else {
      this.animationManager!.playIdleAnimation();
    }
  }

  private setupStateVerification(): void {
    this.time.delayedCall(500, () => {
      if (!this.critter.isHealthy &&
        this.animationManager?.getCurrentAnimation() !== 'sick_idle') {
        console.warn('State mismatch detected - forcing sick animation');
        this.animationManager?.playSickIdleAnimation();
      }
    });
  }

  protected handleQuit = async (): Promise<void> => {
    try {
      // Add pre-quit cleanup
      console.log('[Game] Starting quit process...');

      if (this.critter?.critterId) {
        await this.eventBus.deactivateCritter(Number(this.critter.critterId));
      }
    } catch (error) {
      console.warn('Deactivation failed:', error);
    } finally {
      // Force synchronous shutdown before scene transition
      this.shutdown();

      // Add small delay to ensure shutdown completes
      await new Promise(resolve => setTimeout(resolve, 50));

      console.log('[Game] Transitioning to PetMenu');
      this.scene.stop('Game');
      this.scene.start('PetMenu');
    }
  };

  protected handleRespond = (): void => {
    if (!this.critter?.critterId) {
      console.error('No critter available to respond');
      return;
    }
    this.eventBus.respondToCall(this.critter.critterId);
  };

  protected handleFeed = (): void => {
    this.resetFeedingState();
    this.scene.start('FoodPantry', {
      selectedCritter: this.critter,
      returnScene: 'Game'
    });
  };

  protected handleHeal(): void {
    this.scene.start('MedicineCabinet', {
      selectedCritter: this.critter
    });
  }

  protected handlePlay(): void {
    if (!this.critter?.critterId) {
      console.error('No critter available to play with');
      return;
    }
    this.eventBus.playWithCritter(this.critter.critterId, 10);
  }

  private resetFeedingState(): void {
    this.returningFromFeeding = false;
    this.wasFoodSelected = false;
    this.selectedFood = null;
  }

  override shutdown() {
    console.log('[Game] shutdown called');

    // 1. Immediately stop all animations and timers
    this.animationManager?.stopAllAnimations();
    this.time.removeAllEvents();

    // 2. Clean up input first to prevent interactions during shutdown
    this.cleanupInput();

    // 3. Synchronously clean up animations (remove the delayed call)
    if (this.animationManager) {
      this.animationManager.destroy();
      this.animationManager = null;
    }

    // 4. Clean up UI elements
    this.cleanupUI();

    // 5. Reset state
    this.resetState();

    // 6. Call parent shutdown
    super.shutdown();

    console.log('Game scene shutdown complete');
  }

  protected override cleanupInput(): void {
    this.input.keyboard?.removeAllListeners();
    this.input.off('pointerdown');
    this.input.off('pointerup');
    this.input.off('pointermove');
  }

  private cleanupUI(): void {
    const uiElements = [
      this.quitButton,
      this.feedButton,
      this.respondButton,
      this.healButton,
      this.playButton
    ];

    uiElements.forEach(element => {
      if (!element) return;

      // Remove from display list first
      if (element instanceof Phaser.GameObjects.GameObject) {
        element.removeFromDisplayList();
        element.removeInteractive();
      }

      // Then destroy
      element.removeAllListeners();
      element.destroy();
    });
  }

  private cleanupAnimations(): void {
    if (this.animationManager) {
      // Stop any running animations first
      this.animationManager.stopAllAnimations();

      // Add a small delay to ensure animations complete cleanup
      this.time.delayedCall(10, () => {
        this.animationManager!.destroy();
        this.animationManager = null;
      });
    }
  }

  private resetState(): void {
    this.selectedFood = null;
    this.returningFromFeeding = false;
    this.wasFoodSelected = false;
    this.wasSickBeforeTransition = false;
  }
}
