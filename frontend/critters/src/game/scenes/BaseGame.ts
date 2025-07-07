import { Scene } from 'phaser';
import { EventBusService } from '../../app/services/event-bus.service';
import { CritterStatsPanel } from './helpers/CritterStatsPanel';
import { GameButton } from './helpers/GameButton';
import { EVOLUTION_SPRITES, EvolutionStage } from './helpers/constants';
import { lastValueFrom, Subscription } from 'rxjs';

export abstract class BaseGame extends Scene {
  protected pet!: Phaser.GameObjects.Sprite;
  protected bg!: Phaser.GameObjects.Image;
  protected eventBus!: EventBusService;
  protected selectedCritter: any;
  protected statsPanel!: CritterStatsPanel;

  // Buttons
  protected quitButton!: GameButton;
  protected feedButton!: GameButton;
  protected respondButton!: GameButton;
  protected healButton!: GameButton;

  protected critterSubscription!: Subscription;
  protected critter!: any;
  private critterUpdateSubscription?: Subscription;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  init(data: { selectedCritter: any }) {
    this.selectedCritter = data.selectedCritter;
    this.critter = data.selectedCritter;
    console.log('Scene started with critter:', this.selectedCritter);
  }

  preload() {
    // Load common assets
    this.load.spritesheet('baby_idle', '../assets/baby/baby_idle1.PNG', {
      frameWidth: 256,
      frameHeight: 256,
      margin: 0,
      spacing: 0,
    });

    this.load.spritesheet('pet', '../assets/shisa/shisa_idle1.PNG', {
      frameWidth: 148,
      frameHeight: 128,
      margin: 0,
      spacing: 0,
    });
  }

  async create() {
    this.createCommonElements();
    await this.initializeCritter();
    this.setupSubscriptions();

    if (this.shouldCreateCritter()) {
      this.createCritter();
    }
  }

  protected createCommonElements() {
    const { width, height } = this.scale;

    // Background
    this.bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.bg.setDisplaySize(width, height);

    // EventBus
    this.eventBus = this.game.registry.get('eventBus');
    if (!this.eventBus) {
      console.error('EventBus not found in registry!');
      this.scene.start('MainMenu');
      return;
    }

    // Common Buttons
    this.createButtons();
    this.setupKeyboard();
  }

  protected async initializeCritter() {
    if (!this.critter && this.selectedCritter?.critterId) {
      this.critter = await lastValueFrom(
        this.eventBus.critterService.getCritterById(this.selectedCritter.critterId)
      );
      this.eventBus.emitCritterById(this.critter.critterId);
    }

    if (this.critter?.critterId) {
      await this.activateCurrentCritter();
    }
  }

  private setupSubscriptions() {
    // Base critter data
    this.critterSubscription = this.eventBus.critter$.subscribe(critter => {
      if (critter) {
        this.critter = critter;
        this.updateCritterDisplay();
      }
    });

    // Real-time updates
    this.critterUpdateSubscription = this.eventBus.critterUpdate$.subscribe(updatedCritter => {
      if (updatedCritter && this.critter?.critterId === updatedCritter.critterId) {
        this.critter = updatedCritter;
        this.updateCritterDisplay();
      }
    });
  }

  private updateCritterDisplay() {
    if (!this.critter) return;

    // Update stats panel
    if (this.statsPanel) {
      this.statsPanel.updateStats(this.critter);
    }

    // Update sprite if evolution stage changed
    if (this.critter.evolutionStage) {
      this.setCritterSprite(this.critter.evolutionStage);
    }
  }

  private async activateCurrentCritter(): Promise<void> {
    const critterId = Number(this.critter.critterId);
    try {
      const success = await this.eventBus.activateCritter(critterId);
      if (success) {
        console.log('Critter activated successfully');
        // Force refresh after activation
        this.eventBus.emitCritterById(critterId);
      }
    } catch (error) {
      console.error('Activation error:', error);
    }
  }

  protected createButtons() {
    this.quitButton = new GameButton({
      scene: this,
      x: 233,
      y: 375,
      label: 'quit button',
      onClick: async () => this.handleQuit()
    });

    this.respondButton = new GameButton({
      scene: this,
      x: 233,
      y: 776,
      label: 'respond',
      onClick: () => this.handleRespond()
    });

    this.feedButton = new GameButton({
      scene: this,
      x: 446,
      y: 776,
      label: 'feed',
      onClick: () => this.handleFeed()
    });

    this.healButton = new GameButton({
      scene: this,
      x: 661,
      y: 776,
      label: 'HEAL',
      onClick: () => this.handleHeal()
    });

    this.add.existing(this.quitButton);
    this.add.existing(this.respondButton);
    this.add.existing(this.healButton);
    this.add.existing(this.feedButton);

    console.log(this.healButton);
  }

  protected setupKeyboard() {
    this.input.keyboard?.on('keydown-ESC', () => {
      this.game.scene.start('MainMenu', { eventBus: this.eventBus });
    });
  }

  protected shouldCreateCritter(): boolean {
    // Override this in child classes if they don't need a critter
    return true;
  }

  protected createCritter() {
    if (!this.anims.exists('shisa_idle1')) {
      this.anims.create({
        key: 'shisa_idle1',
        frames: this.anims.generateFrameNumbers('pet', { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1,
      });
    }

    const pet = this.add.sprite(550, 500, 'pet');
    pet.play('shisa_idle1');
    pet.setScale(2);

    this.statsPanel = new CritterStatsPanel(this, this.selectedCritter, 850, 200);
  }

  // Abstract methods child classes must implement
  protected abstract handleQuit(): Promise<void>;
  protected abstract handleRespond(): void;
  protected abstract handleFeed(): void;
  protected abstract handleHeal(): void;

  shutdown() {
    //Destroy game objects
    if (this.bg) {
      this.bg.destroy();
    }
    if (this.statsPanel) {
      this.statsPanel.destroy();
    }
    if (this.quitButton) {
      this.quitButton.destroy();
    }
    if (this.feedButton) {
      this.feedButton.destroy();
    }
    if (this.healButton) {
      this.healButton.destroy();
    }

    // Remove keyboard listener
    const keyboard = this.input.keyboard;
    if (keyboard) {
    if (keyboard) {
      keyboard.off('keydown-ESC');
    }

    // Clear references
    this.selectedCritter = null;

    if (this.critterUpdateSubscription) {
      this.critterUpdateSubscription.unsubscribe();
    }

    this.critterUpdateSubscription?.unsubscribe();
  }
  }

  private setCritterSprite(stage: EvolutionStage) {
    // Destroy previous sprite if exists
    if (this.pet) {
      this.pet.destroy();
    }

    const sprites = EVOLUTION_SPRITES[stage];

    // Create new sprite
    this.pet = this.add.sprite(550, 500, sprites.idle);

    // Create animations for this stage
    this.anims.create({
      key: `${stage}_idle`,
      frames: this.anims.generateFrameNumbers(sprites.idle, {
        start: 0, end: 2 // adjust based on your frames
      }),
      frameRate: 6,
      repeat: -1
    });

    // Play the idle animation
    this.pet.play(`${stage}_idle`);

    // Set scale if needed (different sizes per evolution)
    const scales = {
      [EvolutionStage.BABY]: 1.8,
      [EvolutionStage.FINAL]: 1.2
    };
    this.pet.setScale(scales[stage]);
  }
}
