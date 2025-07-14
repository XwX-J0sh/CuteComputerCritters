import {BaseGame} from './BaseGame';

export class Game extends BaseGame {

  private returningFromFeeding = false;
  private selectedFood: string | null = null;

  constructor() {
    super({ key: 'Game' });
  }

  override init(data: { selectedCritter: any; food?: string }) {
    super.init(data);
    this.selectedCritter = data.selectedCritter;

    // Only set feeding flags if coming from FoodPantry
    if (data.food) {
      this.selectedFood = data.food;
      this.returningFromFeeding = true;
    }
  }

  override async create(): Promise<void> {
    await super.create();
    this.add.image(562, 405, 'home');

    if (!this.critter) {
      console.error('No critter available for animation');
      return;
    }

    console.log('Animation manager exists:', !!this.animationManager);

    // Play idle animation by default
    this.animationManager?.playIdleAnimation();

    // Only play feed animation if specifically returning from feeding
    if (this.returningFromFeeding && this.selectedFood) {
      await this.playFeedAnimation();
      this.returningFromFeeding = false;
      this.selectedFood = null;
    } else {
      // Default to idle animation
      this.playIdleAnimation();
    }
  }

  private async playFeedAnimation() {
    if (!this.animationManager) return;

    try {
      // Play eat animation
      await this.animationManager.playEatAnimation();

      // Return to idle animation after eating
      this.animationManager.playIdleAnimation();
    } catch (error) {
      console.error('Error playing feed animation:', error);
    }
  }

  private playIdleAnimation() {
    if (!this.animationManager) {
      console.error('Animation manager not ready');
      return;
    }
    this.animationManager.playIdleAnimation();
  }

  protected handleQuit = async () => {
    if (this.critter?.critterId) {
      try {
        await this.eventBus.deactivateCritter(Number(this.critter.critterId));
      } catch (error) {
        console.warn('Deactivation failed:', error);
      }
    }
    this.scene.stop('Game')
    this.scene.start('PetMenu');
  };

  protected handleRespond = () => {
    this.eventBus.respondToCall(this.critter.critterId);
  };

  protected handleFeed = () => {
    this.returningFromFeeding = true;
    this.scene.stop('Game')
    this.scene.start('FoodPantry', {
      selectedCritter: this.critter,
      returnScene: 'Game'
    });
  };

  protected handleHeal(): void {
    this.scene.stop('Game')
    this.scene.start('MedicineCabinet', {
      selectedCritter: this.critter
    });
  }

  protected handlePlay(): void {
    this.eventBus.playWithCritter(this.critter.critterId, 10);
  }

  override shutdown() {
    super.shutdown();

    if (this.animationManager) {
      this.animationManager.destroy();
      this.animationManager = null;
    }

    console.log('Game scene shutdown complete');
  }
}
