import { BaseGame } from './BaseGame';
import {Critter} from './helpers/constants';
import {CritterGetResponse} from '../../app/shared/model/CritterGetResponse';

interface FoodItem {
  name: string;
  spriteKey: string;
}

interface FoodPantryData {
  selectedCritter: Critter;
}

export class FoodPantry extends BaseGame {
  private foodItems: FoodItem[] = [];
  private selectedFoodIndex = 0;
  private foodContainers: Phaser.GameObjects.Container[] = [];
  private keyboardNav?: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };
  private passedCritter?: Critter;

  constructor() {
    super({ key: 'FoodPantry' });
  }

  override init(data: FoodPantryData) {
    this.passedCritter = data.selectedCritter;
    console.log('Received critter:', this.passedCritter);
  }

  override preload() {
    this.load.spritesheet('Bread', '../assets/items/bread.PNG', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  override async create() {
    super.create();
    console.log('FoodPantry scene created');

    if (!this.passedCritter) {
      console.error('No critter passed to FoodPantry!');
      this.scene.start('Game'); // Fallback
      return;
    }

    // Initialize food items data
    this.foodItems = [
      { name: 'Cake', spriteKey: 'Cake' },
      { name: 'Bread', spriteKey: 'Bread' },
      { name: 'Candy', spriteKey: 'Candy' },
      { name: 'Salad', spriteKey: 'Salad' },
    ];

    this.createFoodSelectionUI();
    this.setupKeyboardNavigation();
    this.setupButtons();

    // Debug information
    console.log('Food containers created:', this.foodContainers.length);
    console.log('Selected critter:', this.selectedCritter);
  }

  private setupButtons() {
    if (!this.feedButton || !this.respondButton || !this.quitButton) {
      console.warn('Buttons not found!');
      return;
    }

    // Feed button
    this.feedButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.feedButton.setAlpha(0.8))
      .on('pointerout', () => this.feedButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Feed button pressed');
        this.scene.stop('FoodPantry');
        this.scene.start('Game');
      });

    // Respond button
    this.respondButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.respondButton.setAlpha(0.8))
      .on('pointerout', () => this.respondButton.setAlpha(1))
      .on('pointerdown', () => {
        console.log('Respond button pressed');
        this.handleRespond();
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
    this.foodContainers.forEach((container, index) => {
      this.highlightFood(container, index === this.selectedFoodIndex);
    });
  }

  private selectFood(food: FoodItem) {
    console.log(`Selected ${food.name} for critter`, this.passedCritter);
    try {
      this.eventBus.feedCritter(this.passedCritter!.critterId, food.name);
    } catch (error) {
      console.log('Failed to select food: ' ,error);
    }
    this.scene.start('Game', { selectedCritter: this.passedCritter });
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
    this.scene.start('Game', { selectedCritter: this.passedCritter });
    return Promise.resolve();
  };

  protected handleFeed = async () => {
    const selectedFood = this.foodItems[this.selectedFoodIndex];

    //if user has chosen no food, return to Game
    if (!selectedFood){
      this.scene.stop('FoodPantry');
      this.scene.start('Game');
      return;
    }

    console.log(`Feeding ${selectedFood.name} to critter`, this.passedCritter);

    try {
      // 1. First feed the critter (this updates backend)
      const success = await this.eventBus.feedCritter(
        this.passedCritter!.critterId,
        selectedFood.name
      );

      if (!success) {
        console.error('Feeding failed');
        return;
      }

      // 2. Get updated critter data (optional but recommended)
      const updatedCritter = await this.getUpdatedCritter();

      // 3. Return to GameScene with updated data
      this.scene.start('Game', {
        selectedCritter: updatedCritter || this.passedCritter
      });
    } catch (error) {
      console.error('Feeding error:', error);
      // Fallback - return with original critter data
      this.scene.start('Game', { selectedCritter: this.passedCritter });
    }
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
  }

  private highlightFood(container: Phaser.GameObjects.Container, isSelected: boolean) {
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
    this.keyboardNav.up.on('down', () => this.navigateFood(-1));
    this.keyboardNav.down.on('down', () => this.navigateFood(1));
    this.keyboardNav.left.on('down', () => this.navigateFood(-1));
    this.keyboardNav.right.on('down', () => this.navigateFood(1));

    // Selection
    this.keyboardNav.enter.on('down', () => this.handleFeed());
    this.keyboardNav.space.on('down', () => this.handleFeed());

    // WASD navigation
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).on('down', () => this.navigateFood(-1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on('down', () => this.navigateFood(1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).on('down', () => this.navigateFood(-1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).on('down', () => this.navigateFood(1));

    // Escape for quit
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', this.handleQuit);
  }

  private navigateFood(direction: number) {
    if (this.foodItems.length === 0) return;

    this.selectedFoodIndex = Phaser.Math.Wrap(
      this.selectedFoodIndex + direction,
      0,
      this.foodItems.length
    );
    this.updateSelection();
    console.log(`Navigated to food index: ${this.selectedFoodIndex}`);
  }

  private createFoodSelectionUI() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const itemSpacingX = 200; // Horizontal spacing between items
    const itemSpacingY = 150; // Vertical spacing between rows
    const itemScale = 1.5;

    // Clear any existing containers
    this.foodContainers.forEach(container => container.destroy());
    this.foodContainers = [];

    // Create a 2x2 grid layout
    this.foodItems.forEach((food, index) => {
      const container = this.add.container(0, 0);

      // Calculate position based on grid layout
      const row = index < 2 ? 0 : 1; // First two items in top row, next two in bottom row
      const col = index % 2; // Alternating columns

      const xPos = centerX + (col === 0 ? -itemSpacingX/2 : itemSpacingX/2);
      const yPos = centerY + (row === 0 ? -itemSpacingY : itemSpacingY);

      // Food sprite
      const foodSprite = this.add.sprite(xPos, yPos - 30, food.spriteKey)
        .setScale(itemScale)
        .setInteractive({ useHandCursor: true });

      // Food label
      const foodLabel = this.add.text(xPos, yPos + 50, food.name, {
        font: '24px Arial',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      // Add to container
      container.add([foodSprite, foodLabel]);

      // Set interactive area (larger than the sprite for better UX)
      container.setInteractive(
        new Phaser.Geom.Rectangle(
          xPos - foodSprite.displayWidth/2 - 10,
          yPos - 30 - foodSprite.displayHeight/2 - 10,
          foodSprite.displayWidth + 20,
          foodSprite.displayHeight + 90 // Includes label space
        ),
        Phaser.Geom.Rectangle.Contains
      );

      // Mouse events
      container.on('pointerover', () => {
        this.selectedFoodIndex = index;
        this.updateSelection();
      });

      container.on('pointerdown', () => {
        this.selectFood(food);
      });

      this.foodContainers.push(container);

      // Initial highlight for first item
      if (index === 0) {
        this.highlightFood(container, true);
      }
    });

    // Add instructional text
    this.add.text(centerX, centerY + 200,
      'Use arrow keys or click to select food\nPress ENTER or click Feed to confirm',
      {
        font: '18px Arial',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
  }

  protected override shouldCreateCritter(): boolean {
    return false;
  }
}
