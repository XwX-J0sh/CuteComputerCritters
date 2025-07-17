import { Scene } from 'phaser';
import { EventBusService } from '../../app/services/event-bus.service';
import { CritterStatsPanel } from './helpers/CritterStatsPanel';
import { GameButton } from './helpers/GameButton';
import {distinctUntilChanged, filter, lastValueFrom, Subscription} from 'rxjs';
import {AnimationLoader} from './helpers/AnimationLoader';
import {ASSET_CONFIG} from './helpers/assets-config';

export abstract class BaseGame extends Scene {
  protected pet!: Phaser.GameObjects.Sprite;
  protected bg!: Phaser.GameObjects.Image;
  protected eventBus!: EventBusService;
  protected selectedCritter: any;
  protected statsPanel!: CritterStatsPanel;
  protected animationManager!: AnimationLoader | null;

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
  private alertSound!: Phaser.Sound.BaseSound;
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
    // Add error handling for loading
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('Failed to load:', file.key, file.url);
    });

    // sounds
    this.load.audio('critterCall', '../assets/sounds/tamagotchi_alert.mp3');
    this.load.audio('critterAlert', '../assets/sounds/tamagotchi_alert2.mp3');

    // Load baby sprites with debug logging
    Object.entries(ASSET_CONFIG.baby).forEach(([animation, config]) => {
      const key = `baby_${animation}`;
      console.log(`Loading baby texture: ${key} from ${config.path}`);
      this.load.spritesheet(
        key,
        config.path,
        {
          frameWidth: config.frameWidth,
          frameHeight: config.frameHeight
        }
      );
    });

    // Load variant sprites with debug logging
    Object.entries(ASSET_CONFIG.variants).forEach(([variant, animations]) => {
      Object.entries(animations).forEach(([animation, config]) => {
        const key = `${variant}_${animation}`;
        console.log(`Loading variant texture: ${key} from ${config.path}`);
        this.load.spritesheet(
          key,
          config.path,
          {
            frameWidth: config.frameWidth,
            frameHeight: config.frameHeight
          }
        );
      });
    });
  }

  async create() {

    this.createCommonElements();
    await this.initializeCritter();

    this.createStatsPanel();

    console.log('Loaded Textures:', this.textures.getTextureKeys());

    // Create animation manager and stats panel together
    this.createCritter();
    this.updateCritterDisplay();
    this.setupSubscriptions();

    // Debug play
    this.time.delayedCall(1000, () => {
      console.log('Attempting to play idle animation...');
      this.animationManager?.playIdleAnimation();

      // Debug stats panel
      if (this.statsPanel) {
        console.log('Stats panel exists:', this.statsPanel);
        this.children.each(child => {
          console.log('Scene child:', child);
        });
      } else {
        console.error('Stats panel not created!');
      }
    });
  }

  private createStatsPanel() {
    // Destroy existing panel if any
    if (this.statsPanel) {
      this.statsPanel.destroy();
    }

    // Create new panel with current critter or empty data
    this.statsPanel = new CritterStatsPanel(
      this,
      this.critter || { health: 0, hunger: 0, happiness: 0 },
      770,
      270
    );
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
    this.alertSound = this.sound.add('critterAlert');
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
        filter(updatedCritter => {
          if (!updatedCritter || this.critter?.critterId !== updatedCritter.critterId) {
            return false;
          }

          // Trigger when: critter is sickk or the stats are low (below or equal to 3)
          return !updatedCritter.isHealthy ||
            updatedCritter.hunger <= 3 ||
            updatedCritter.happiness <= 3;
        }),
        distinctUntilChanged((previous, current) => {
          return previous?.isHealthy === current?.isHealthy &&
            previous?.hunger === current?.hunger &&
            previous?.happiness === current?.happiness;
        })
      )
      .subscribe(updatedCritter => {
        this.playAlertSound();
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

  //play call noise when critter calls for attention
  private playCallSound() {
    try {
      if (!this.callSound.isPlaying) {
        this.callSound.play();
      }
    } catch (error) {
      console.error('Error playing call sound:', error);
    }
  }

  //play alert noise (for sickness/low stats)
  private playAlertSound() {
    try {
      if (!this.alertSound.isPlaying) {
        this.alertSound.play();
      }
    } catch (error) {
      console.error('Error playing alert sound:', error);
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
      y: 100,
      label: 'QUIT',
      onClick: async () => this.handleQuit()
    });

    this.respondButton = new GameButton({
      scene: this,
      x: 233,
      y: 776,
      label: 'RESPOND',
      onClick: () => this.handleRespond()
    });

    this.feedButton = new GameButton({
      scene: this,
      x: 446,
      y: 776,
      label: 'FEED',
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
    if (!this.critter || !this.shouldCreateCritter()) return;

    // Debug: Check critter data
    console.log('Creating critter with:', this.critter);

    // Clear previous animation if exists
    if (this.animationManager) {
      this.animationManager.destroy();
    }

    // Create new animation manager
    this.animationManager = new AnimationLoader(this, this.critter);

    this.animationManager.debugTextureScales();

    //update stats panel with current critter
    if (this.statsPanel) {
      this.statsPanel.updateStats(this.critter);
    }

    // Debug: Verify sprite creation
    const sprite = this.animationManager.getSprite();
    console.log('Critter sprite created at:', sprite.x, sprite.y);
    console.log('Sprite visible:', sprite.visible);
    console.log('Texture key:', sprite.texture.key);
  }

  private updateCritterDisplay() {
    if (!this.critter || !this.animationManager) {
      console.warn('Cannot update display - critter or animation manager not ready');
      return;
    }

    try {
      this.animationManager.updateCritterData(this.critter);
      if (this.statsPanel) {
        this.statsPanel.updateStats(this.critter);
      }
    } catch (error) {
      console.error('Error updating critter display:', error);
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
