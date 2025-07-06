import { Scene } from 'phaser';
import {EventBusService} from '../../app/services/event-bus.service';
import {CritterStatsPanel} from './helpers/CritterStatsPanel';
import {GameButton} from './helpers/GameButton';
import {EVOLUTION_SPRITES, EvolutionStage} from './helpers/constants';
import {Subscription} from 'rxjs';

export class Game extends Scene {
  pet!: Phaser.GameObjects.Sprite;
  bg!: Phaser.GameObjects.Image;
  eventBus!: EventBusService;
  selectedCritter: any;
  statsPanel!: CritterStatsPanel;
  quitButton!: GameButton;
  feedButton!: GameButton;
  critterSubscription!: Subscription;
  critter!: any;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 100;

  constructor() {
    super('Game');
  }

  init(data: { selectedCritter: any }) {
    this.selectedCritter = data.selectedCritter;
    this.critter = data.selectedCritter;
    console.log('Game started with critter:', this.selectedCritter);
  }

  preload() {

    this.load.spritesheet('baby_idle', '../assets/baby_idle1.PNG', {
      frameWidth: 256,  // width of a single frame
      frameHeight: 256, // height of a single frame
      margin: 0,
      spacing: 0,
    });

    this.load.spritesheet('pet', '../assets/shisa_idle1.png', {
      frameWidth: 148,  // width of a single frame
      frameHeight: 128, // height of a single frame
      margin: 0,
      spacing: 0,
    });
  }

  async create() {
    const { width, height} = this.scale;

    // Add background first
    this.bg = this.add.image(0, 0, 'background').setOrigin(0,0);
    this.bg.setDisplaySize(width, height);

    this.eventBus = this.game.registry.get('eventBus');
    if (!this.eventBus) {
      console.error('EventBus not found in registry!');
      // Handle error case - either return to previous scene or create default
      this.scene.start('MainMenu');
      return;
    }

    // Initialize critter from init data or request it
    if (!this.critter && this.selectedCritter?.critterId) {
      this.eventBus.emitCritterById(this.selectedCritter.critterId);
    }

    // Subscribe to critter updates
    this.critterSubscription = this.eventBus.critter$.subscribe(critter => {
      if (critter) {
        this.critter = critter;
        console.log('Critter updated:', critter);
        this.updateCritterDisplay();
        this.events.on('update', this.handleUpdate, this);
      }
    });

    // Activate critter in database when scene starts
    if (this.critter?.critterId) {
      const critterId = Number(this.critter.critterId);
      const success = await this.eventBus.activateCritter(critterId);

      if (success) {
        console.log('Critter activated in database');
        //this.updateCritterDisplay();
      } else {
        console.warn('Failed to activate critter in database');
      }
    }

    // Define the idle animation
    // Only create animation if it doesn't exist
    if (!this.anims.exists('shisa_idle1')) {
      this.anims.create({
        key: 'shisa_idle1',
        frames: this.anims.generateFrameNumbers('pet', {
          start: 0,
          end: 1,
        }),
        frameRate: 2,
        repeat: -1,
      });
    }

    // Create the avatar sprite and play the idle animation
    this.pet = this.add.sprite(550, 500, 'pet');
    this.pet.play('shisa_idle1');
    this.pet.setScale(2)

    // Create stats panel
    this.statsPanel = new CritterStatsPanel(this, this.selectedCritter, 850, 200);

    // Check keyboard plugin before attaching listener
    const keyboard = this.input.keyboard;
    if (keyboard) {
      keyboard.on('keydown-ESC', () => {
        console.log('Escape pressed. Going back to MainMenu.');
        this.game.scene.start('MainMenu', { eventBus: this.eventBus });
      });
    } else {
      console.warn('Keyboard input not ready!');
    }

    this.quitButton = new GameButton({scene: this,
    x: 233,
    y: 375,
    label: 'quit button',
    onClick: async () => {
      this.scene.stop('Game');
      this.scene.start('MainMenu');
      // First try to deactivate
      if (this.critter?.critterId) {
        const critterId = Number(this.critter.critterId);
        try {
          await this.eventBus.deactivateCritter(critterId);
          console.log('Critter deactivated in database');
        } catch (error) {
          console.warn('Failed to deactivate critter:', error);
        }
      }

      // Then switch scenes regardless of deactivation result
      this.scene.stop('Game');
      this.scene.start('MainMenu');
      }
    });

    this.feedButton = new GameButton({scene: this,
      x: 233,
      y: 375,
      label: 'quit button',
      onClick: () => {
      },
    })

    this.add.existing(this.quitButton);
  }

  shutdown() {
    //Destroy game objects
    if (this.pet) {
      this.pet.destroy();
    }
    if (this.bg) {
      this.bg.destroy();
    }
    if (this.statsPanel) {
      this.statsPanel.destroy();
    }
    if (this.quitButton) {
      this.quitButton.destroy();
    }

    // Remove keyboard listener
    const keyboard = this.input.keyboard;
    if (keyboard) {
      keyboard.off('keydown-ESC');
    }

    // Clear references
    this.selectedCritter = null;
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

  private handleUpdate(time: number) {
    // Throttle updates for performance
    if (time - this.lastUpdateTime > this.updateInterval) {
      this.lastUpdateTime = time;
      if (this.critter) {
        this.updateCritterDisplay();
      }
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
