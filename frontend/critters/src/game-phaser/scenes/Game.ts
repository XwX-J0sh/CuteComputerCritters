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
    await super.create();
    this.add.image(346, 405, 'home');

    if (!this.critter || !this.animationManager) {
      console.error('Critter or animation manager not ready');
      return;
    }

    //Force sync with current health state
    const shouldBeSick = !this.critter.isHealthy;
    this.wasSickBeforeTransition = shouldBeSick; // Keep this updated

    console.group('Animation State Debug');
    console.log('Current health:', this.critter.isHealthy);
    console.log('Should show sick:', shouldBeSick);
    console.groupEnd();

    // Immediate animation lock
    if (shouldBeSick) {
      console.log('Forcing sick idle animation');
      this.animationManager.playSickIdleAnimation();
    } else {
      this.animationManager.playIdleAnimation();
    }

    if (this.returningFromFeeding && this.selectedFood && this.animationManager) {
      console.log('Playing feed animation for', this.selectedFood);
      this.animationManager.playFeedingSequence(this.selectedFood);
      this.resetFeedingState(); // Clear the feeding flags
      return; // Skip the rest of create if we just played feed animation
    }

    // Delayed state verification
    this.time.delayedCall(500, () => {
      if (!this.critter.isHealthy && this.animationManager?.getCurrentAnimation() !== 'sick_idle') {
        console.warn('State mismatch detected - forcing sick animation');
        this.animationManager?.playSickIdleAnimation();
      }
    });
  }

  protected handleQuit = async (): Promise<void> => {
    try {
      if (this.critter?.critterId) {
        await this.eventBus.deactivateCritter(Number(this.critter.critterId));
      }
    } catch (error) {
      console.warn('Deactivation failed:', error);
    } finally {
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
    this.scene.stop('Game');
    this.scene.start('FoodPantry', {
      selectedCritter: this.critter,
      returnScene: 'Game'
    });
  };

  protected handleHeal(): void {
    this.scene.stop('Game');
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
    // Clean up input first
    this.input.keyboard?.removeAllListeners();
    this.input.off('pointerdown');

    // Destroy buttons and their listeners
    [this.quitButton, this.feedButton, this.respondButton,
      this.healButton, this.playButton].forEach(btn => {
      btn?.removeAllListeners();  // Clear event listeners first
      btn?.destroy();             // Then destroy the object
    });

    // Other cleanup remains the same
    if (this.animationManager) {
      this.animationManager.destroy();
      this.animationManager = null;
    }

    super.shutdown();
    console.log('Game scene shutdown complete');
  }
}
