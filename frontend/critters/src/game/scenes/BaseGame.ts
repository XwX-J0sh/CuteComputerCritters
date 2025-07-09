import { Scene } from 'phaser';
import { EventBusService } from '../../app/services/event-bus.service';
import { CritterStatsPanel } from './helpers/CritterStatsPanel';
import { GameButton } from './helpers/GameButton';
import {distinctUntilChanged, filter, lastValueFrom, Subscription} from 'rxjs';
import {AnimationLoader} from './helpers/AnimationLoader';

export abstract class BaseGame extends Scene {
  protected pet!: Phaser.GameObjects.Sprite;
  protected bg!: Phaser.GameObjects.Image;
  protected eventBus!: EventBusService;
  protected selectedCritter: any;
  protected statsPanel!: CritterStatsPanel;
  protected animationManager!: AnimationLoader;

  // Buttons
  protected quitButton!: GameButton;
  protected feedButton!: GameButton;
  protected respondButton!: GameButton;
  protected healButton!: GameButton;
  protected playButton!: GameButton;

  protected critterSubscription!: Subscription;
  protected critter!: any;
  private critterUpdateSubscription?: Subscription;
  private hasCalledSubscription!: Subscription;
  private statIsLowSubscription!: Subscription;
  private callSound!: Phaser.Sound.BaseSound;
  private isDeadSubscription!: Subscription;

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

    this.load.audio('critterCall', '../assets/sounds/tamagotchi_alert.mp3');
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

    this.callSound = this.sound.add('critterCall');
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

    //sound subscriptions
    this.setupHasCalledSubscription();
    this.setupStatsIsLowSubscription();

    //game over subscription
    this.setupIsDeadSubscription();
  }

  private setupHasCalledSubscription() {
    this.hasCalledSubscription = this.eventBus.critterUpdate$
      .pipe(
        filter(updatedCritter =>
          updatedCritter! &&
          this.critter?.critterId === updatedCritter.critterId
        ),
        distinctUntilChanged((prev, curr) =>
          prev?.hasCalled === curr?.hasCalled &&
          prev?.calledSince === curr?.calledSince
        )
      )
      .subscribe(updatedCritter => {
        // Play sound immediately when call starts
        if (updatedCritter!.hasCalled && !updatedCritter!.calledSince) {
          this.playCallSound();
        }
        // Also play if call was just initiated
        else if (updatedCritter!.hasCalled && updatedCritter!.calledSince) {
          const callTime = new Date(updatedCritter!.calledSince).getTime();
          if (Date.now() - callTime < 5000) { // Only if called within last 5s
            this.playCallSound();
          }
        }
      });
  }

  private setupStatsIsLowSubscription() {
    this.statIsLowSubscription = this.eventBus.critterUpdate$
      .pipe(
        filter(updatedCritter => updatedCritter! &&
          this.critter?.critterId === updatedCritter?.critterId &&
          (!updatedCritter?.isHealthy || (updatedCritter.hunger || updatedCritter.happiness) <= 1)
        ),
        distinctUntilChanged((previous, current) =>
          previous?.isHealthy === current?.isHealthy &&
          previous?.hunger === current?.hunger &&
          previous?.happiness === current?.happiness
        )
      )
      .subscribe(updatedCritter => {
        // Handle the stat is low notification here
        this.playCallSound();
      });
  }

  private setupIsDeadSubscription() {
    this.isDeadSubscription = this.eventBus.critterUpdate$
      .pipe(
        filter(updatedCritter => updatedCritter! &&
          this.critter?.critterId === updatedCritter?.critterId &&
          updatedCritter?.isDead
        ),
        distinctUntilChanged((previous, current) =>
          previous?.isDead === current?.isDead
        )
      )
      .subscribe(updatedCritter => {
        //if the critter has died send to game over screen
        this.scene.stop('BaseGame');
        this.scene.start('GameOver');
      });
  }

  private playCallSound() {
    try {
      if (!this.callSound.isPlaying) {
        this.callSound.play();
      }
    } catch (error) {
      console.error('Error playing call sound:', error);
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

    this.playButton = new GameButton({
      scene: this,
      x: 876,
      y: 776,
      label: 'PLAY',
      onClick: () => this.handlePlay()
    });

    // Add buttons to scene without sound
    this.add.existing(this.quitButton);
    this.add.existing(this.respondButton);
    this.add.existing(this.healButton);
    this.add.existing(this.feedButton);
    this.add.existing(this.playButton);
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
    if (!this.critter) return;

    // Clear previous animation if exists
    if (this.animationManager) {
      this.animationManager.getSprite().destroy();
    }

    this.animationManager = new AnimationLoader(this, this.critter);
    this.statsPanel = new CritterStatsPanel(this, this.critter, 850, 200);
  }

  private updateCritterDisplay() {
    if (!this.critter) return;

    // Update animation manager first
    this.animationManager.updateCritterData(this.critter);

    // Then update stats panel
    if (this.statsPanel) {
      this.statsPanel.updateStats(this.critter);
    }
  }

  // Abstract methods child classes must implement
  protected abstract handleQuit(): Promise<void>;
  protected abstract handleRespond(): void;
  protected abstract handleFeed(): void;
  protected abstract handleHeal(): void;
  protected abstract handlePlay(): void;

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
    if (this.callSound) {
      this.callSound.stop();
      this.callSound.destroy();
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
    this.hasCalledSubscription?.unsubscribe();
    this.statIsLowSubscription?.unsubscribe();
    this.isDeadSubscription?.unsubscribe();
  }
  }

}
