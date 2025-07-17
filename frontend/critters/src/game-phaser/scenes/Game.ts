import { BaseGame } from './BaseGame';

export class Game extends BaseGame {
  private returningFromFeeding = false;
  private selectedFood: string | null = null;
  private wasFoodSelected = false;

  constructor() {
    super({ key: 'Game' });
  }

  override init(data: { selectedCritter: any; food?: string }) {
    super.init(data);
    this.selectedCritter = data.selectedCritter;

    // Set feeding flags only if food is provided
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

    if (!this.critter) {
      console.error('No critter available for animation');
      return;
    }

    // Initialize animation manager if not already done
    if (!this.animationManager) {
      console.error('Animation manager not initialized');
      return;
    }

    // Single source of truth for animation logic
    if (this.returningFromFeeding && this.selectedFood && this.wasFoodSelected) {
      console.log(`Playing feed animation for ${this.selectedFood}`);
      try {
        await this.playFeedAnimation();
      } catch (error) {
        console.error('Feed animation failed, falling back to idle', error);
        this.playIdleAnimation();
      }
    } else {
      console.log('Playing idle animation');
      this.playIdleAnimation();
    }
  }

  private async playFeedAnimation(): Promise<void> {
    if (!this.animationManager) {
      throw new Error('Animation manager not available');
    }

    try {
      await this.animationManager.playEatAnimation();
      this.animationManager.playIdleAnimation();
    } finally {
      // Reset feeding state regardless of success/failure
      this.returningFromFeeding = false;
      this.selectedFood = null;
      this.wasFoodSelected = false;
    }
  }

  private playIdleAnimation(): void {
    if (!this.animationManager) {
      console.error('Animation manager not ready');
      return;
    }
    this.animationManager.playIdleAnimation();
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

  override shutdown(): void {
    if (this.animationManager) {
      this.animationManager.destroy();
      this.animationManager = null;
    }
    super.shutdown();
    console.log('Game scene shutdown complete');
  }
}
