import {BaseGame} from './BaseGame';

export class Game extends BaseGame {

  constructor() {
    super({ key: 'Game' });
  }

  protected handleQuit = async () => {
    if (this.critter?.critterId) {
      try {
        await this.eventBus.deactivateCritter(Number(this.critter.critterId));
      } catch (error) {
        console.warn('Deactivation failed:', error);
      }
    }
    this.scene.start('MainMenu');
  };

  protected handleRespond = () => {
    this.eventBus.respondToCall(this.critter.critterId);
  };

  protected handleFeed = () => {
    this.scene.start('FoodPantry', {
      selectedCritter: this.critter
    });
  };
}
