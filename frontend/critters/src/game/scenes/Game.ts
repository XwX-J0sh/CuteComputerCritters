import {BaseGame} from './BaseGame';

export class Game extends BaseGame {

  constructor() {
    super({ key: 'Game' });
  }

  override async create(): Promise<void> {
    super.create();
    this.add.image(562, 405, 'home');
  }

  protected handleQuit = async () => {
    if (this.critter?.critterId) {
      try {
        await this.eventBus.deactivateCritter(Number(this.critter.critterId));
      } catch (error) {
        console.warn('Deactivation failed:', error);
      }
    }
    this.scene.start('PetMenu');
  };

  protected handleRespond = () => {
    this.eventBus.respondToCall(this.critter.critterId);
  };

  protected handleFeed = () => {
    this.scene.start('FoodPantry', {
      selectedCritter: this.critter
    });
  };

  protected handleHeal(): void {
    this.scene.start('MedicineCabinet', {
      selectedCritter: this.critter
    });
  }

  protected handlePlay(): void {
    this.eventBus.playWithCritter(this.critter.critterId, 10);
  }
}
