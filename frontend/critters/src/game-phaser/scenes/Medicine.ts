import { BaseGame } from './BaseGame';
import {Critter} from './helpers/constants';
import {CritterGetResponse} from '../../app/shared/model/CritterGetResponse';
import Phaser from 'phaser';

interface MedicineItem {
  name: string;
  spriteKey: string;
}

interface MedicineCabinetData {
  selectedCritter: Critter;
}

export class MedicineCabinet extends BaseGame {
  private medicineItems: MedicineItem[] = [];
  private selectedMedicineIndex = 0;
  private medicineContainers: Phaser.GameObjects.Container[] = [];
  private keyboardNav?: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };
  private passedCritter?: Critter;
  private isHealingInProgress = false;

  constructor() {
    super({ key: 'MedicineCabinet' });
  }

  override init(data: MedicineCabinetData) {
    super.init(data); // CRUCIAL - like FoodPantry
    this.passedCritter = data.selectedCritter;
    this.critter = data.selectedCritter; // Sync with BaseGame
    console.log('MedicineCabinet received critter:', this.passedCritter);
  }

  override preload() {
    this.load.spritesheet('Pill', '../assets/items/pill.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  override async create() {
    super.create();
    console.log('MedicineCabinet scene created');

    await super.create(); // Important await like FoodPantry
    console.log('MedicineCabinet scene created');

    if (!this.passedCritter) {
      console.error('No critter passed!');
      this.scene.stop('MedicineCabinet');
      this.scene.start('Game');
      return;
    }

    // Update stats panel like FoodPantry
    if (this.statsPanel) {
      this.statsPanel.updateStats(this.passedCritter);
    }

    if (!this.passedCritter) {
      console.error('No critter passed to MedicineCabinetScene!');
      this.scene.start('Game'); // Fallback
      return;
    }

    // Initialize food items data
    this.medicineItems = [
      { name: 'Pill', spriteKey: 'Pill' },
      { name: 'Band-Aid', spriteKey: 'Band-Aid' },
    ];

    this.createMedicineSelectionUI();
    this.setupKeyboardNavigation();
    this.setupButtons();

    // Debug information
    console.log('Med containers created:', this.medicineContainers.length);
    console.log('Selected critter:', this.selectedCritter);
  }

  private setupButtons() {
    if (!this.feedButton || !this.respondButton || !this.quitButton || !this.healButton) {
      console.warn('Buttons not found!');
      return;
    }

    // Feed button
    this.feedButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.feedButton.setAlpha(0.8))
      .on('pointerout', () => this.feedButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Feed button pressed');
        this.scene.stop('MedicineCabinet');
        this.scene.start('FoodPantry');
      });

    // Respond button
    this.respondButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.respondButton.setAlpha(0.8))
      .on('pointerout', () => this.respondButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Respond button pressed');
        this.handleRespond();
      });

    // Heal button
    this.healButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.healButton.setAlpha(0.8))
      .on('pointerout', () => this.healButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Heal button pressed');
        this.handleHeal();  // Call handleHeal directly
      });

    // Quit button
    this.quitButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.quitButton.setAlpha(0.8))
      .on('pointerout', () => this.quitButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Quit button pressed');
        this.handleQuit();
      });
  }

  private updateSelection() {
    this.medicineContainers.forEach((container, index) => {
      this.highlightMedicine(container, index === this.selectedMedicineIndex);
    });
  }

  protected handleQuit = async () => {
    this.scene.start('Game', { selectedCritter: this.passedCritter });
    return Promise.resolve();
  };

  protected handleRespond = async () => {
    try {
      this.eventBus.respondToCall(this.passedCritter!.critterId);
    }
    catch (error) {
      console.log('Failed to respond to call: ' ,error);
    }
  };

  protected handleFeed = async () => {
    this.scene.stop('MedicineCabinet');
    this.scene.start('FoodPantry');
  };

  private async getUpdatedCritter(): Promise<CritterGetResponse | undefined | null> {
    try {
      // Assuming your eventBus or critterService has a way to fetch current data
      const updatedCritter = await this.eventBus.critterService.getCritterById(
        this.passedCritter!.critterId
      ).toPromise();

      return updatedCritter;
    } catch (error) {
      console.warn('Failed to fetch updated critter:', error);
      return null;
    }
  }

  override shutdown() {
    super.shutdown();

    if (this.keyboardNav) {
      Object.values(this.keyboardNav).forEach(key => key.removeAllListeners());
    }

    this.medicineContainers.forEach(container => {
      container.removeAllListeners();
      container.removeInteractive();
      container.getAll().forEach(child => {
        if (child instanceof Phaser.GameObjects.Sprite ||
          child instanceof Phaser.GameObjects.Text) {
          child.destroy();
        }
      });
      container.destroy();
    });

    this.medicineContainers = [];
  }

  private highlightMedicine(container: Phaser.GameObjects.Container, isSelected: boolean) {
    const [sprite, text] = container.list as [Phaser.GameObjects.Sprite, Phaser.GameObjects.Text];

    sprite.setTint(isSelected ? 0x44ff44 : 0xffffff);
    text.setStyle({
      color: isSelected ? '#ff9900' : '#ffffff',
      fontStyle: isSelected ? 'bold' : 'normal'
    });
  }

  private setupKeyboardNavigation() {
    if (!this.input?.keyboard) {
      console.warn('Keyboard input not available');
      return;
    }

    this.keyboardNav = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      enter: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // Arrow key navigation
    this.keyboardNav.up.on('down', () => this.navigateMedicine(-1));
    this.keyboardNav.down.on('down', () => this.navigateMedicine(1));
    this.keyboardNav.left.on('down', () => this.navigateMedicine(-1));
    this.keyboardNav.right.on('down', () => this.navigateMedicine(1));

    // Selection
    this.keyboardNav.enter.on('down', () => this.handleHeal());
    this.keyboardNav.space.on('down', () => this.handleHeal());

    // WASD navigation
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).on('down', () => this.navigateMedicine(-1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on('down', () => this.navigateMedicine(1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).on('down', () => this.navigateMedicine(-1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).on('down', () => this.navigateMedicine(1));

    // Escape for quit
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', this.handleQuit);
  }

  private navigateMedicine(direction: number) {
    if (this.medicineItems.length === 0) return;

    this.selectedMedicineIndex = Phaser.Math.Wrap(
      this.selectedMedicineIndex + direction,
      0,
      this.medicineItems.length
    );
    this.updateSelection();
    console.log(`Navigated to medicine index: ${this.selectedMedicineIndex}`);
  }

  private createMedicineSelectionUI() {
    const leftOffset = 220;
    const centerX = this.cameras.main.width / 2 - leftOffset;
    const centerY = this.cameras.main.height / 2;
    const itemSpacingX = 200; // Horizontal spacing between items
    const itemSpacingY = 150; // Vertical spacing between rows
    const itemScale = 1.5;

    // Clear any existing containers
    this.medicineContainers.forEach(container => container.destroy());
    this.medicineContainers = [];

    // Create a 2x2 grid layout
    this.medicineItems.forEach((medicine, index: number) => {
      const container = this.add.container(0, 0);

      // Calculate position based on grid layout
      const row = index < 2 ? 0 : 1; // First two items in top row, next two in bottom row
      const col = index % 2; // Alternating columns

      const xPos = centerX + (col === 0 ? -itemSpacingX/2 : itemSpacingX/2);
      const yPos = centerY + (row === 0 ? -itemSpacingY : itemSpacingY);

      // Medicine sprite
      const medicineSprite = this.add.sprite(xPos, yPos - 30, medicine.spriteKey)
        .setScale(itemScale)
        .setInteractive({ useHandCursor: true });

      // Medicine label
      const medicineLabel = this.add.text(xPos, yPos + 50, medicine.name, {
        font: '24px Arial',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      // Add to container
      container.add([medicineSprite, medicineLabel]);

      // Set interactive area (larger than the sprite for better UX)
      container.setInteractive(
        new Phaser.Geom.Rectangle(
          xPos - medicineSprite.displayWidth/2 - 10,
          yPos - 30 - medicineSprite.displayHeight/2 - 10,
          medicineSprite.displayWidth + 20,
          medicineSprite.displayHeight + 90 // Includes label space
        ),
        Phaser.Geom.Rectangle.Contains
      );

      // Mouse events
      container.on('pointerover', () => {
        this.selectedMedicineIndex = index;
        this.updateSelection();
      });

      container.on('pointerdown', () => {
        this.handleHeal();
      });

      this.medicineContainers.push(container);

      // Initial highlight for first item
      if (index === 0) {
        this.highlightMedicine(container, true);
      }
    });
  }

  protected override shouldCreateCritter(): boolean {
    return false;
  }

  protected async handleHeal(): Promise<void> {
    if (this.isHealingInProgress) return; // Prevent double-healing
    this.isHealingInProgress = true;

    const selectedMedicine = this.medicineItems[this.selectedMedicineIndex];
    if (!selectedMedicine || !this.passedCritter) {
      this.isHealingInProgress = false;
      return;
    }

    try {
      console.log(`Healing with ${selectedMedicine.name}`);

      const medicineType = selectedMedicine.name.toUpperCase().replace('-', '_');
      await this.eventBus.healCritter(
        this.passedCritter.critterId,
        medicineType
      );

      const updatedCritter = await this.getUpdatedCritter();
      console.log('Healing successful:', updatedCritter);

      this.scene.stop('MedicineCabinet');
      this.scene.start('Game', {
        selectedCritter: updatedCritter || this.passedCritter
      });
    } catch (error) {
      console.error('Healing failed:', error);
      this.scene.start('Game', {selectedCritter: this.passedCritter});
    } finally {
      this.isHealingInProgress = false;
    }
  }

  protected handlePlay(): void {
    this.eventBus.playWithCritter(this.critter.critterId, 10);
  }
}
